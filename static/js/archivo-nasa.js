"use strict";
document.addEventListener('DOMContentLoaded',()=>{
 const root=document.getElementById('scienceGallery');
 const sections=[['apollo','science.apollo'],['mars','science.mars'],['spirit','science.spirit']];
 function draw(){root.replaceChildren();const language=StarI18n.lang;
  for(const [group,key] of sections){const section=document.createElement('section');section.className='science-section';const heading=document.createElement('h2');heading.textContent=StarI18n.t(key);section.append(heading);const grid=document.createElement('div');grid.className='science-grid';
   for(const photo of StarScience.photos.filter(p=>p.group===group)){const card=document.createElement('article');card.className='science-card';const image=document.createElement('img');image.src=photo.file;image.alt=photo[language];image.loading='lazy';const title=document.createElement('h3');title.textContent=photo.title;const text=document.createElement('p');text.textContent=photo[language];const credit=document.createElement('small');credit.textContent=photo.credit;card.append(image,title,text,credit);if(photo.url){const a=document.createElement('a');a.href=photo.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent='NASA / JPL';card.append(a);}grid.append(card);}section.append(grid);root.append(section);}
 }
 draw();document.addEventListener('starstep:language',draw);
});
