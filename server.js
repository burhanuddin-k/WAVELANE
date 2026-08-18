import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Database from "better-sqlite3";
import {fileURLToPath} from "url";

const __filename=fileURLToPath(import.meta.url), __dirname=path.dirname(__filename);
const PORT=process.env.PORT||4000, app=express();
const DATA=path.join(__dirname,"data"), AUDIO=path.join(__dirname,"uploads/audio"), COVERS=path.join(__dirname,"uploads/covers");
[DATA,AUDIO,COVERS].forEach(x=>fs.mkdirSync(x,{recursive:true}));

const db=new Database(path.join(DATA,"wavelane.db"));
db.exec(`CREATE TABLE IF NOT EXISTS songs(
id INTEGER PRIMARY KEY AUTOINCREMENT,title TEXT NOT NULL,artist TEXT NOT NULL,
album TEXT DEFAULT 'Single',genre TEXT DEFAULT 'Other',description TEXT DEFAULT '',
audio_url TEXT NOT NULL,cover_url TEXT DEFAULT '',duration INTEGER DEFAULT 0,
plays INTEGER DEFAULT 0,published INTEGER DEFAULT 1,created_at TEXT DEFAULT CURRENT_TIMESTAMP)`);

app.use(express.json());
app.use(express.static(path.join(__dirname,"public")));
app.use("/admin",express.static(path.join(__dirname,"admin")));
app.use("/uploads",express.static(path.join(__dirname,"uploads")));

const storage=multer.diskStorage({
 destination:(req,file,cb)=>cb(null,file.fieldname==="audio"?AUDIO:COVERS),
 filename:(req,file,cb)=>cb(null,`${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(file.originalname).toLowerCase()}`)
});
const upload=multer({storage,limits:{fileSize:100*1024*1024},fileFilter:(req,file,cb)=>{
 if(file.fieldname==="audio"&&file.mimetype.startsWith("audio/")) return cb(null,true);
 if(file.fieldname==="cover"&&file.mimetype.startsWith("image/")) return cb(null,true);
 cb(new Error("Invalid file type"));
}});

app.get("/api/health",(req,res)=>res.json({ok:true,name:"WaveLane"}));
app.get("/api/songs",(req,res)=>{
 const q=String(req.query.q||"").trim(), genre=String(req.query.genre||"").trim();
 let rows;
 if(q){const x=`%${q}%`;rows=db.prepare("SELECT * FROM songs WHERE published=1 AND (title LIKE ? OR artist LIKE ? OR album LIKE ? OR genre LIKE ?) ORDER BY created_at DESC").all(x,x,x,x)}
 else if(genre) rows=db.prepare("SELECT * FROM songs WHERE published=1 AND genre=? ORDER BY created_at DESC").all(genre);
 else rows=db.prepare("SELECT * FROM songs WHERE published=1 ORDER BY created_at DESC").all();
 res.json(rows);
});
app.get("/api/admin/songs",(req,res)=>res.json(db.prepare("SELECT * FROM songs ORDER BY id DESC").all()));
app.get("/api/stats",(req,res)=>res.json({
 songs:db.prepare("SELECT COUNT(*) c FROM songs").get().c,
 published:db.prepare("SELECT COUNT(*) c FROM songs WHERE published=1").get().c,
 plays:db.prepare("SELECT COALESCE(SUM(plays),0) c FROM songs").get().c,
 artists:db.prepare("SELECT COUNT(DISTINCT artist) c FROM songs").get().c
}));
app.post("/api/admin/songs",upload.fields([{name:"audio",maxCount:1},{name:"cover",maxCount:1}]),(req,res)=>{
 const audio=req.files?.audio?.[0], cover=req.files?.cover?.[0];
 if(!audio)return res.status(400).json({error:"Audio file is required"});
 const title=String(req.body.title||"").trim(), artist=String(req.body.artist||"").trim();
 if(!title||!artist)return res.status(400).json({error:"Title and artist are required"});
 const r=db.prepare(`INSERT INTO songs(title,artist,album,genre,description,audio_url,cover_url,published)
 VALUES(?,?,?,?,?,?,?,?)`).run(title,artist,String(req.body.album||"Single"),String(req.body.genre||"Other"),
 String(req.body.description||""),`/uploads/audio/${audio.filename}`,cover?`/uploads/covers/${cover.filename}`:"",1);
 res.json({success:true,song:db.prepare("SELECT * FROM songs WHERE id=?").get(r.lastInsertRowid)});
});
app.put("/api/admin/songs/:id",(req,res)=>{
 const id=Number(req.params.id),s=db.prepare("SELECT * FROM songs WHERE id=?").get(id);
 if(!s)return res.status(404).json({error:"Song not found"});
 db.prepare("UPDATE songs SET title=?,artist=?,album=?,genre=?,description=?,published=? WHERE id=?")
 .run(req.body.title??s.title,req.body.artist??s.artist,req.body.album??s.album,req.body.genre??s.genre,req.body.description??s.description,Number(req.body.published??s.published),id);
 res.json(db.prepare("SELECT * FROM songs WHERE id=?").get(id));
});
app.delete("/api/admin/songs/:id",(req,res)=>{
 const id=Number(req.params.id),s=db.prepare("SELECT * FROM songs WHERE id=?").get(id);
 if(!s)return res.status(404).json({error:"Song not found"});
 [s.audio_url,s.cover_url].forEach(u=>{if(u){const f=path.join(__dirname,u.replace(/^\//,""));if(fs.existsSync(f))fs.unlinkSync(f)}});
 db.prepare("DELETE FROM songs WHERE id=?").run(id);res.json({success:true});
});
app.post("/api/songs/:id/play",(req,res)=>{db.prepare("UPDATE songs SET plays=plays+1 WHERE id=?").run(Number(req.params.id));res.json({success:true})});
app.use((err,req,res,next)=>res.status(400).json({error:err.message||"Request failed"}));
app.listen(PORT,"0.0.0.0",()=>console.log(`WaveLane: http://localhost:${PORT}`));