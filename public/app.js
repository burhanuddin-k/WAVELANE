const S={songs:[],queue:[],i:-1,view:"home",shuffle:false,repeat:false,liked:JSON.parse(localStorage.liked||"[]"),recent:JSON.parse(localStorage.recent||"[]")};
const A=document.querySelector("#audio"),C=document.querySelector("#content"),DC="/assets/default-cover.svg";
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const cover=s=>s.cover_url||DC,fmt=x=>{x=Number(x)||0;return `${Math.floor(x/60)}:${String(Math.floor(x%60)).padStart(2,"0")}`};
async function songs(url=""){S.songs=await fetch("/api/songs"+url).then(r=>r.json());render()}
function card(s){return `<article class="card" data-id="${s.id}"><img class="cover" src="${esc(cover(s))}"><div class="title">${esc(s.title)}</div><p class="artist">${esc(s.artist)}</p></article>`}
function section(t,a){return `<div class="head"><h2>${t}</h2><span style="color:#777">${a.length} songs</span></div>${a.length?`<div class="grid">${a.map(card).join("")}</div>`:`<div class="empty">No songs yet. Open Admin Studio to upload your first track.</div>`}`}
function render(){let a=S.songs;if(S.view==="home")C.innerHTML=`<section class="hero"><div><div class="kicker">Your sound. Your lane.</div><h1>Music that moves with you.</h1><p>Discover music, build your collection and enjoy a clean Spotify-inspired player powered by your own WaveLane library.</p><button class="primary">Explore music</button></div></section>${section("Fresh on WaveLane",a.slice(0,6))}${section("All releases",a)}`;
else if(S.view==="discover")C.innerHTML=`<h1>Discover</h1>${section("Latest music",a)}`;
else if(S.view==="library")C.innerHTML=`<h1>Your Library</h1>${section("Your music",a)}`;
else if(S.view==="liked"){let x=a.filter(s=>S.liked.includes(s.id));C.innerHTML=`<h1>Liked Songs</h1>${section("Saved for you",x)}`;
}else{let x=S.recent.map(id=>a.find(s=>s.id===id)).filter(Boolean);C.innerHTML=`<h1>Recently Played</h1>${section("Keep listening",x)}`}
document.querySelectorAll(".card").forEach(e=>e.onclick=()=>play(a.find(s=>s.id==e.dataset.id)))}
function play(s){if(!s)return;S.queue=S.shuffle?[...S.songs].sort(()=>Math.random()-.5):[...S.songs];S.i=S.queue.findIndex(x=>x.id===s.id);A.src=s.audio_url;A.play();document.querySelector("#pc").src=cover(s);document.querySelector("#pt").textContent=s.title;document.querySelector("#pa").textContent=s.artist;document.querySelector("#play").textContent="Ⅱ";document.querySelector("#like").textContent=S.liked.includes(s.id)?"♥":"♡";S.recent=[s.id,...S.recent.filter(x=>x!==s.id)].slice(0,20);localStorage.recent=JSON.stringify(S.recent);fetch(`/api/songs/${s.id}/play`,{method:"POST"})}
function current(){return S.queue[S.i]}
document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>{document.querySelectorAll("nav button").forEach(x=>x.classList.remove("active"));b.classList.add("active");S.view=b.dataset.view;render()});
document.querySelector("#search").oninput=async e=>{S.view="discover";S.songs=await fetch("/api/songs?q="+encodeURIComponent(e.target.value)).then(r=>r.json());render()};
document.querySelector("#play").onclick=()=>{if(!A.src&&S.songs[0])return play(S.songs[0]);if(A.paused){A.play();document.querySelector("#play").textContent="Ⅱ"}else{A.pause();document.querySelector("#play").textContent="▶"}};
document.querySelector("#next").onclick=()=>{if(!S.queue.length)return;S.i++;if(S.i>=S.queue.length){if(S.repeat)S.i=0;else return A.pause()}play(S.queue[S.i])};
document.querySelector("#prev").onclick=()=>{if(S.queue.length){S.i=(S.i-1+S.queue.length)%S.queue.length;play(S.queue[S.i])}};
document.querySelector("#shuffle").onclick=e=>{S.shuffle=!S.shuffle;e.currentTarget.style.color=S.shuffle?"#a8ff2a":""};
document.querySelector("#repeat").onclick=e=>{S.repeat=!S.repeat;e.currentTarget.style.color=S.repeat?"#a8ff2a":""};
document.querySelector("#like").onclick=()=>{let s=current();if(!s)return;S.liked=S.liked.includes(s.id)?S.liked.filter(x=>x!==s.id):[...S.liked,s.id];localStorage.liked=JSON.stringify(S.liked);document.querySelector("#like").textContent=S.liked.includes(s.id)?"♥":"♡"};
A.ontimeupdate=()=>{document.querySelector("#cur").textContent=fmt(A.currentTime);document.querySelector("#bar").value=A.duration?A.currentTime/A.duration*100:0};
A.onloadedmetadata=()=>document.querySelector("#dur").textContent=fmt(A.duration);
A.onended=()=>S.repeat?play(current()):document.querySelector("#next").click();
document.querySelector("#bar").oninput=e=>{if(A.duration)A.currentTime=e.target.value/100*A.duration};
document.querySelector("#volume").oninput=e=>A.volume=e.target.value;A.volume=.8;songs();