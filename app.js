const SUPABASE_URL = "https://ykjtkrfpqulybssyshhr.supabase.co";
const SUPABASE_KEY = "sb_publishable_c7pKOlu7-jxlZBDJNLcRCw_VPIuy52u";
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const team=[['Sam','Director'],['Jamie','Director'],['Ben','Construction Director'],['Kennedy','Admin + Socials'],['Dylan','Area Manager'],['Les','Plant Manager'],['Lloyd','Groundworker'],['Jack','Apprentice'],['Aiden','Supervisor'],['Rhys','Groundworker'],['Mark','Groundworker'],['James','Supervisor'],['Jamie P','Groundworker'],['Stan','Groundworker'],['Corey','Groundworker — Machine'],['Craig','Groundworker']];
const jobs=[['The Old Mill','Richmond','Active','68%'],['Scorton Meadows','Scorton','Active','42%'],['Riverside Barns','Darlington','Planning','15%']];let user=null,clockedIn=false,view='home';
const $=s=>document.querySelector(s);const initials=n=>n.split(' ').map(x=>x[0]).join('');
function boot(){$('#teamGrid').innerHTML=team.map((x,i)=>`<button class="team-card" data-i="${i}"><div class="avatar">${initials(x[0])}</div><b>${x[0].split(' ')[0]}</b><small>${x[1]}</small></button>`).join('');$('#teamGrid').onclick=e=>{let b=e.target.closest('[data-i]');if(b)select(team[b.dataset.i])};$('#nav').onclick=e=>{let b=e.target.closest('[data-view]');if(b)go(b.dataset.view)};$('#menu').onclick=()=>$('.sidebar').classList.toggle('open');$('#signOut').onclick=async()=>{await db.auth.signOut();localStorage.removeItem('jfc-user');location.reload()};}
function select(p){user=p;localStorage.setItem('jfc-user',JSON.stringify(p));$('#loginScreen').classList.add('hidden');$('#app').classList.remove('hidden');$('#userName').textContent=p[0].split(' ')[0];$('#profileButton').textContent=initials(p[0]);go('home')}
const header=(label,title)=>{$('#headerLabel').textContent=label;$('#pageTitle').innerHTML=title;document.querySelectorAll('#nav button').forEach(x=>x.classList.toggle('active',x.dataset.view===view));$('.sidebar').classList.remove('open')};
function go(v){view=v;let render={home:home,time:time,jobs:jobsView,photos:photos,plant:plant,docs:docs,reports:reports,management:management,social:social}[v];render()}
function home(){header('OPERATIONS OVERVIEW',`Good morning, <span>${user[0].split(' ')[0]}</span>`);$('#content').innerHTML=`<div class="page"><div class="topline"><div><h3>Wednesday, 16 September</h3><div class="date">Here’s the latest across James Ford Construction.</div></div><button class="secondary" onclick="go('reports')">View daily report →</button></div><section class="hero"><div><p class="eyebrow" style="color:#bdd9f3">TODAY'S SHIFT</p><h3>${clockedIn?'You are clocked in':'Ready to start your day?'}</h3><p>${clockedIn?'Clocked in at 07:24 · Scorton Meadows':'Select a site and clock in when you arrive.'}</p></div><div class="clock"><div class="clock-time">${new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}</div><button class="primary" onclick="toggleClock()">${clockedIn?'Clock out':'Clock in'}</button></div></section><section class="stats"><div class="stat"><span class="label">TEAM ON SITE</span><strong>12 <small>/ 16</small></strong><span class="trend">↑ 2 since yesterday</span></div><div class="stat"><span class="label">ACTIVE JOBS</span><strong>3</strong><span class="trend">All on programme</span></div><div class="stat"><span class="label">OPEN DEFECTS</span><strong>2</strong><span class="trend" style="color:#db8b1a">Needs review today</span></div><div class="stat"><span class="label">H&S COMPLIANCE</span><strong>96%</strong><span class="trend">↑ 3% this month</span></div></section><section class="grid cols-2"><div class="panel"><div class="panel-head"><h3>Today’s priorities</h3><button class="link" onclick="showModal('Add priority')">+ Add</button></div><div class="list"><div class="row"><span class="row-icon">▣</span><div class="grow"><div class="row-title">Concrete pour — Scorton Meadows</div><div class="sub">Due 10:30 · Connor Bell</div></div><span class="pill amber">IN PROGRESS</span></div><div class="row"><span class="row-icon">⚙</span><div class="grow"><div class="row-title">Daily check — JCB 3CX</div><div class="sub">Due before 08:00 · Sam Brown</div></div><span class="pill">COMPLETE</span></div><div class="row"><span class="row-icon">▤</span><div class="grow"><div class="row-title">RAMS review — Riverside Barns</div><div class="sub">Due today · Dylan Hutcheon</div></div><span class="pill red">ACTION</span></div></div></div><div class="panel"><div class="panel-head"><h3>Who’s where</h3><button class="link" onclick="go('management')">Full view →</button></div><div class="where">${[['CB','Connor Bell','Scorton Meadows',80],['BH','Ben Hall','Scorton Meadows',65],['LG','Lewis Gray','The Old Mill',50],['SB','Sam Brown','Yard / Plant',38]].map(x=>`<div class="where-item"><div class="avatar">${x[0]}</div><div><b>${x[1]}</b><div class="sub">${x[2]}<div class="progress"><i style="width:${x[3]}%"></i></div></div></div><span class="pill">ON SITE</span></div>`).join('')}</div></div></section><section class="panel" style="margin-top:18px"><div class="panel-head"><h3>Quick actions</h3></div><div class="action-grid"><button class="quick" onclick="toggleClock()"><b>◷ ${clockedIn?'Clock out':'Clock in'}</b>Record today’s attendance</button><button class="quick" onclick="go('plant')"><b>⚙ Plant check</b>Complete a daily inspection</button><button class="quick" onclick="go('photos')"><b>▣ Add site photo</b>Upload progress evidence</button></div></section></div>`}
async function time(){
  header('ATTENDANCE','Weekly timesheet');

  const { data:{ user:authUser } } = await db.auth.getUser();

  if(!authUser){
    $('#content').innerHTML='<div class="page"><div class="panel"><h3>Please sign in again.</h3></div></div>';
    return;
  }

  const { data:staff, error:staffError } = await db
    .from('staff')
    .select('*')
    .eq('auth_user_id',authUser.id)
    .single();

  if(staffError || !staff){
    $('#content').innerHTML='<div class="page"><div class="panel"><h3>Staff record not found.</h3><p class="section-intro">Please contact an administrator.</p></div></div>';
    return;
  }

  const today=new Date();
  const day=today.getDay();
  const diff=day===0?-6:1-day;
  const monday=new Date(today);
  monday.setDate(today.getDate()+diff);
  monday.setHours(0,0,0,0);

  const iso=d=>{
    const y=d.getFullYear();
    const m=String(d.getMonth()+1).padStart(2,'0');
    const day=String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  };

  const weekStart=iso(monday);

  const days=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const dates=days.map((name,i)=>{
    const d=new Date(monday);
    d.setDate(monday.getDate()+i);
    return {name,date:iso(d),display:d.toLocaleDateString('en-GB',{day:'2-digit',month:'short'})};
  });

  const { data:jobList=[] } = await db
    .from('jobs')
    .select('id,name,location,status')
    .order('name');

  let { data:sheet } = await db
    .from('weekly_timesheets')
    .select('*')
    .eq('staff_id',staff.id)
    .eq('week_commencing',weekStart)
    .maybeSingle();

  if(!sheet){
    const { data:newSheet,error } = await db
      .from('weekly_timesheets')
      .insert({
        staff_id:staff.id,
        week_commencing:weekStart,
        status:'draft'
      })
      .select()
      .single();

    if(error){
      $('#content').innerHTML=`<div class="page"><div class="panel"><h3>Could not create your timesheet.</h3><p class="section-intro">${error.message}</p></div></div>`;
      return;
    }

    sheet=newSheet;
  }

  const { data:entries=[] } = await db
    .from('timesheet_entries')
    .select('*')
    .eq('timesheet_id',sheet.id)
    .order('work_date');

  const entryMap={};
  entries.forEach(e=>entryMap[e.work_date]=e);

  const locked=sheet.status==='submitted'||sheet.status==='approved';

  $('#content').innerHTML=`
    <div class="page">
      <div class="topline">
        <div>
          <h3>${staff.full_name}</h3>
          <p class="section-intro">Week commencing ${monday.toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'})}</p>
        </div>
        <span class="pill ${sheet.status==='draft'?'amber':''}">${sheet.status.toUpperCase()}</span>
      </div>

      <div class="panel">
        <div class="panel-head">
          <h3>Weekly hours</h3>
          <span class="sub">Enter the hours and job for each day.</span>
        </div>

        <div style="overflow-x:auto">
          <table class="table">
            <thead>
              <tr>
                <th>DAY</th>
                <th>DATE</th>
                <th>JOB / SITE</th>
                <th>HOURS</th>
                <th>NOTES</th>
              </tr>
            </thead>
            <tbody>
              ${dates.map(d=>{
                const e=entryMap[d.date]||{};
                return `
                  <tr>
                    <td><b>${d.name}</b></td>
                    <td>${d.display}</td>
                    <td>
                      <select class="timesheet-job" data-date="${d.date}" ${locked?'disabled':''} style="min-width:180px;padding:9px;border:1px solid #d9e0e7;border-radius:6px">
                        <option value="">Select site</option>
                        ${jobList.map(j=>`<option value="${j.id}" ${e.job_id===j.id?'selected':''}>${j.name}</option>`).join('')}
                      </select>
                    </td>
                    <td>
                      <input class="timesheet-hours" data-date="${d.date}" type="number" min="0" max="24" step="0.5" value="${e.hours??''}" ${locked?'disabled':''} style="width:90px;padding:9px;border:1px solid #d9e0e7;border-radius:6px">
                    </td>
                    <td>
                      <input class="timesheet-notes" data-date="${d.date}" type="text" value="${e.notes||''}" placeholder="Optional" ${locked?'disabled':''} style="min-width:180px;padding:9px;border:1px solid #d9e0e7;border-radius:6px">
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:20px;gap:15px;flex-wrap:wrap">
          <strong>Total hours: <span id="timesheetTotal">0</span></strong>
          ${locked
            ? '<span class="sub">This timesheet has been submitted.</span>'
            : '<button id="saveTimesheet" class="primary">Save & submit timesheet</button>'
          }
        </div>
      </div>
    </div>
  `;

  const updateTotal=()=>{
    let total=0;
    document.querySelectorAll('.timesheet-hours').forEach(input=>{
      total+=Number(input.value)||0;
    });
    $('#timesheetTotal').textContent=total.toFixed(1);
  };

  document.querySelectorAll('.timesheet-hours').forEach(input=>{
    input.addEventListener('input',updateTotal);
  });

  updateTotal();

  if(!locked){
    $('#saveTimesheet').onclick=async()=>{
      const rows=dates.map(d=>{
        const hours=Number(document.querySelector(`.timesheet-hours[data-date="${d.date}"]`).value)||0;
        const jobId=document.querySelector(`.timesheet-job[data-date="${d.date}"]`).value||null;
        const notes=document.querySelector(`.timesheet-notes[data-date="${d.date}"]`).value.trim();

        return {
          timesheet_id:sheet.id,
          work_date:d.date,
          job_id:jobId,
          hours:hours,
          notes:notes
        };
      });

      const { error:entryError }=await db
        .from('timesheet_entries')
        .upsert(rows,{onConflict:'timesheet_id,work_date'});

      if(entryError){
        toast('Could not save timesheet');
        return;
      }

      const { error:sheetError }=await db
        .from('weekly_timesheets')
        .update({
          status:'submitted',
          submitted_at:new Date().toISOString()
        })
        .eq('id',sheet.id);

      if(sheetError){
        toast('Hours saved, but submission failed');
        return;
      }

      toast('Timesheet submitted');
      time();
    };
  }
}

function jobsView(){header('PROJECT DELIVERY','Jobs & sites');$('#content').innerHTML=`<div class="page"><div class="topline"><div><h3>Live projects</h3><p class="section-intro">Programme, team and document status at a glance.</p></div><button class="secondary" onclick="showModal('Create new job')">+ New job</button></div><div class="card-row">${jobs.map((x,i)=>`<article class="site-card"><div class="site-image">${x[0]}</div><div><h3>${x[0]}</h3><p>⌖ ${x[1]} · Site manager: ${i===0?'Tom Wright':'Connor Bell'}</p><div class="progress"><i style="width:${x[3]}"></i></div><p><b>${x[3]}</b> complete <span class="pill ${x[2]==='Planning'?'amber':''}" style="float:right">${x[2].toUpperCase()}</span></p><button class="link" onclick="toast('Site workspace opened')">Open site workspace →</button></div></article>`).join('')}</div><div class="panel" style="margin-top:20px"><h3>Upcoming activity</h3><div class="list"><div class="row"><span class="row-icon">◷</span><div class="grow"><b>Scorton Meadows concrete pour</b><div class="sub">Today · 10:30 · Crew of 6</div></div><span class="pill amber">TODAY</span></div><div class="row"><span class="row-icon">▤</span><div class="grow"><b>Riverside Barns RAMS briefing</b><div class="sub">Tomorrow · 07:30 · All operatives</div></div><span class="pill">SCHEDULED</span></div></div></div></div>`}
function photos(){header('SITE RECORDS','Site photos');$('#content').innerHTML=`<div class="page"><div class="topline"><div><h3>Site photo log</h3><p class="section-intro">Capture progress, quality and H&S evidence by site.</p></div><button class="secondary" onclick="showModal('Upload site photo')">+ Upload photos</button></div><div class="upload" onclick="showModal('Upload site photo')"><b style="font-size:24px">▣</b><br><b>Drop photos here or browse</b><br><small>JPG, PNG or HEIC · Add a site and description for your record</small></div><div class="card-row" style="margin-top:20px">${['Drainage run complete','Foundation preparation','Compound set-up'].map((x,i)=>`<article class="site-card"><div class="site-image" style="background:linear-gradient(135deg,${['#547c78,#a8c9c0','#717c62,#c3b485','#496985,#99b0bd'][i]})">SITE PHOTO · ${i+1}</div><div><h3>${x}</h3><p>Scorton Meadows · Today, 07:${18+i*9}</p><span class="pill">PROGRESS</span></div></article>`).join('')}</div></div>`}
function plant(){header('PLANT & FLEET','Plant daily checks & defects');$('#content').innerHTML=`<div class="page"><div class="topline"><div><h3>Fleet status</h3><p class="section-intro">Complete daily checks before plant leaves the yard.</p></div><div><button class="danger" onclick="showModal('Report plant defect')">Report defect</button> <button class="secondary" onclick="showModal('New plant check')">+ Daily check</button></div></div><div class="panel"><table class="table"><thead><tr><th>PLANT</th><th>ASSIGNED TO</th><th>LAST CHECK</th><th>STATUS</th></tr></thead><tbody>${[['JCB 3CX','Sam Brown','Today · 07:16','READY'],['Takeuchi TB216','Connor Bell','Today · 07:04','READY'],['Bomag Roller','Ben Hall','Yesterday · 16:42','CHECK DUE'],['Ifor Williams Trailer','—','Today · 06:55','DEFECT']].map(x=>`<tr><td><b>${x[0]}</b></td><td>${x[1]}</td><td>${x[2]}</td><td><span class="pill ${x[3]==='CHECK DUE'?'amber':x[3]==='DEFECT'?'red':''}">${x[3]}</span></td></tr>`).join('')}</tbody></table></div><div class="grid cols-2" style="margin-top:18px"><div class="panel"><h3>Open defects</h3><div class="notice"><b>Bomag roller — rear light intermittent</b><span>Reported by Ben Hall · Awaiting plant manager review</span></div><div class="notice"><b>Ifor Williams trailer — tyre wear</b><span>Reported today · Remove from service if condition worsens</span></div></div><div class="panel"><h3>Plant manager focus</h3><p class="section-intro">12 of 14 checks completed today.</p><div class="progress"><i style="width:86%"></i></div><p><button class="link" onclick="toast('Plant manager dashboard opened')">Open full plant manager dashboard →</button></p></div></div></div>`}
function docs(){header('COMPLIANCE LIBRARY','RAMS & documents');$('#content').innerHTML=`<div class="page"><div class="topline"><div><h3>Controlled documents</h3><p class="section-intro">The latest approved RAMS, permits, policies and site packs.</p></div><button class="secondary" onclick="showModal('Upload document')">+ Upload document</button></div><div class="tool-grid">${[['▤','Scorton Meadows RAMS','v3.2 · Approved 14 Sep · Review due Dec'],['▣','Traffic Management Plan','v1.4 · Approved 11 Sep · Current'],['✓','Health & Safety Policy','v2026.1 · Company document · Current'],['⚠','Emergency procedures','v2.0 · Yard and sites · Current'],['◫','COSHH assessments','12 assessments · 2 reviews due'],['⌑','Induction pack','New starter briefing · Current']].map(x=>`<article class="tool-card"><div class="tool-icon">${x[0]}</div><h3>${x[1]}</h3><p>${x[2]}</p><button class="link" onclick="toast('Document opened in a new workspace')">View document →</button></article>`).join('')}</div></div>`}
async function reports(){
  header('SITE RECORDS','Job sheet');

  const { data:{ user:authUser } } = await db.auth.getUser();

  if(!authUser){
    $('#content').innerHTML='<div class="page"><div class="panel"><h3>Please sign in again.</h3></div></div>';
    return;
  }

  const { data:staff } = await db
    .from('staff')
    .select('*')
    .eq('auth_user_id',authUser.id)
    .single();

  if(!staff){
    $('#content').innerHTML='<div class="page"><div class="panel"><h3>Staff record not found.</h3></div></div>';
    return;
  }

  const { data:jobList=[] } = await db
    .from('jobs')
    .select('id,name')
    .eq('status','Active')
    .order('name');

  const today=new Date().toISOString().split('T')[0];

  $('#content').innerHTML=`
    <div class="page">
      <div class="topline">
        <div>
          <h3>Job sheet</h3>
          <p class="section-intro">Record the work completed on site today.</p>
        </div>
        <span class="pill">DRAFT</span>
      </div>

      <div class="panel">
        <div class="grid cols-2">

          <div>
            <label class="label">JOB / SITE</label>
            <select id="jobSheetJob" style="width:100%;padding:11px;border:1px solid #d9e0e7;border-radius:6px;margin-top:6px">
              <option value="">Select job / site</option>
              ${jobList.map(j=>`<option value="${j.id}">${j.name}</option>`).join('')}
            </select>
          </div>

          <div>
            <label class="label">DATE</label>
            <input id="jobSheetDate" type="date" value="${today}" style="width:100%;padding:11px;border:1px solid #d9e0e7;border-radius:6px;margin-top:6px">
          </div>

          <div>
            <label class="label">EMPLOYEE</label>
            <input type="text" value="${staff.full_name}" disabled style="width:100%;padding:11px;border:1px solid #d9e0e7;border-radius:6px;margin-top:6px;background:#f5f7f9">
          </div>

          <div>
            <label class="label">HOURS ON SITE</label>
            <input id="jobSheetHours" type="number" min="0" max="24" step="0.5" placeholder="e.g. 8" style="width:100%;padding:11px;border:1px solid #d9e0e7;border-radius:6px;margin-top:6px">
          </div>

        </div>

        <div style="margin-top:20px">
          <label class="label">WORK CARRIED OUT</label>
          <textarea id="jobSheetWork" rows="5" placeholder="Describe the work completed today..." style="width:100%;padding:11px;border:1px solid #d9e0e7;border-radius:6px;margin-top:6px;resize:vertical"></textarea>
        </div>

        <div style="margin-top:20px">
          <label class="label">MATERIALS USED</label>
          <textarea id="jobSheetMaterials" rows="3" placeholder="List materials used today..." style="width:100%;padding:11px;border:1px solid #d9e0e7;border-radius:6px;margin-top:6px;resize:vertical"></textarea>
        </div>

        <div style="margin-top:20px">
          <label class="label">PLANT / MACHINERY USED</label>
          <textarea id="jobSheetPlant" rows="3" placeholder="List plant or machinery used..." style="width:100%;padding:11px;border:1px solid #d9e0e7;border-radius:6px;margin-top:6px;resize:vertical"></textarea>
        </div>

        <div style="margin-top:20px">
          <label class="label">PROBLEMS / ISSUES</label>
          <textarea id="jobSheetIssues" rows="3" placeholder="Any problems, delays or issues?" style="width:100%;padding:11px;border:1px solid #d9e0e7;border-radius:6px;margin-top:6px;resize:vertical"></textarea>
        </div>

        <div style="margin-top:20px">
          <label class="label">ADDITIONAL NOTES</label>
          <textarea id="jobSheetNotes" rows="3" placeholder="Anything else to record..." style="width:100%;padding:11px;border:1px solid #d9e0e7;border-radius:6px;margin-top:6px;resize:vertical"></textarea>
        </div>

        <div style="display:flex;justify-content:flex-end;margin-top:24px">
          <button id="submitJobSheet" class="primary">Submit job sheet</button>
        </div>

      </div>
    </div>
  `;

  $('#submitJobSheet').onclick=async()=>{
    const jobId=$('#jobSheetJob').value;
    const work=$('#jobSheetWork').value.trim();

    if(!jobId){
      toast('Please select a job / site');
      return;
    }

    if(!work){
      toast('Please describe the work carried out');
      return;
    }

    const { error }=await db
      .from('job_sheets')
      .insert({
        job_id:jobId,
        staff_id:staff.id,
        work_date:$('#jobSheetDate').value,
        work_carried_out:work,
        materials_used:$('#jobSheetMaterials').value.trim(),
        plant_used:$('#jobSheetPlant').value.trim(),
        issues:$('#jobSheetIssues').value.trim(),
        hours_on_site:Number($('#jobSheetHours').value)||0,
        notes:$('#jobSheetNotes').value.trim(),
        status:'submitted'
      });

    if(error){
      toast('Could not submit job sheet');
      return;
    }

    toast('Job sheet submitted');
    reports();
  };
}

function management(){header('MANAGEMENT OVERVIEW','Company overview');$('#content').innerHTML=`<div class="page"><section class="stats"><div class="stat"><span class="label">LIVE REVENUE</span><strong>£284k</strong><span class="trend">Across 3 active jobs</span></div><div class="stat"><span class="label">LABOUR THIS WEEK</span><strong>216h</strong><span class="trend">88% productive time</span></div><div class="stat"><span class="label">JOB COST VARIANCE</span><strong>+2.4%</strong><span class="trend" style="color:#db8b1a">Monitor Scorton concrete</span></div><div class="stat"><span class="label">PLANT UTILISATION</span><strong>78%</strong><span class="trend">3 assets available</span></div></section><div class="grid cols-2"><div class="panel"><h3>Job costing snapshot</h3><table class="table"><thead><tr><th>JOB</th><th>CONTRACT</th><th>COST TO DATE</th><th>FORECAST</th></tr></thead><tbody>${[['The Old Mill','£126,000','£86,420','On target'],['Scorton Meadows','£98,500','£41,360','+2.4%'],['Riverside Barns','£59,500','£3,200','On target']].map(x=>`<tr><td><b>${x[0]}</b></td><td>${x[1]}</td><td>${x[2]}</td><td><span class="pill ${x[3][0]==='+'?'amber':''}">${x[3]}</span></td></tr>`).join('')}</tbody></table></div><div class="panel"><h3>Company team overview</h3><div class="where">${team.map((x,i)=>`<div class="where-item"><div class="avatar">${initials(x[0])}</div><div><b>${x[0]}</b><div class="sub">${x[1]} · ${x[0]==='Kennedy'?'Office / social content':i<5?'Management':'Operations'}</div></div><span class="pill">${x[0]==='Kennedy'?'OFFICE':i<5?'MANAGEMENT':'TEAM'}</span></div>`).join('')}</div></div></div></div>`}
function social(){header('MARKETING DESK','Social media content');$('#content').innerHTML=`<div class="page"><div class="topline"><div><h3>Content planner</h3><p class="section-intro">Turn the team’s site progress into professional, on-brand updates.</p></div><button class="secondary" onclick="showModal('Create social post')">+ Create post</button></div><div class="grid cols-2"><div class="panel"><h3>Draft post · Instagram & LinkedIn</h3><p style="line-height:1.7">Another productive week at <b>Scorton Meadows</b>. The team are progressing the drainage installation and preparing the site for the next concrete pour — keeping things moving safely, efficiently and to programme.<br><br><span style="color:var(--blue)">#JamesFordConstruction #Groundworks #CivilEngineering #Yorkshire</span></p><div class="modal-actions"><button class="secondary" onclick="toast('Post saved as draft')">Save draft</button><button class="primary" style="background:var(--blue);color:#fff" onclick="toast('Post queued for approval')">Queue for approval</button></div></div><div class="panel"><h3>Content opportunities</h3><div class="list"><div class="row"><span class="row-icon">▣</span><div class="grow"><b>New site photos available</b><div class="sub">3 photos from Scorton Meadows — ideal for a progress update</div></div><button class="link" onclick="go('photos')">Use</button></div><div class="row"><span class="row-icon">✓</span><div class="grow"><b>Safety milestone</b><div class="sub">96% H&S compliance this month</div></div><button class="link" onclick="toast('Milestone draft created')">Draft</button></div></div></div></div></div>`}

function toggleClock(){clockedIn=!clockedIn;localStorage.setItem('jfc-clockedIn',clockedIn?'yes':'no');toast(clockedIn?'You are clocked in':'You are clocked out');go(view)}
async function authBoot(){
  const { data: { session } } = await db.auth.getSession();

  if(session){
    const { data: staff } = await db
      .from("staff")
      .select("*")
      .eq("auth_user_id", session.user.id)
      .single();

    if(staff){
      select([staff.full_name, staff.role]);
      return;
    }
  }

  $("#teamGrid").innerHTML = `
    <form id="loginForm" class="login-form">
      <label>Email address</label>
      <input id="loginEmail" type="email" required placeholder="Your JFC email">
      <label>Password</label>
      <input id="loginPassword" type="password" required placeholder="Your password">
      <button class="primary" type="submit">Sign in</button>
      <p id="loginError" class="login-error"></p>
    </form>
  `;

  $("#loginForm").addEventListener("submit", async e => {
    e.preventDefault();

    const email = $("#loginEmail").value.trim();
    const password = $("#loginPassword").value;

    const { error } = await db.auth.signInWithPassword({
      email,
      password
    });

    if(error){
      $("#loginError").textContent = error.message;
      return;
    }

    location.reload();
  });
}

boot();
authBoot();
