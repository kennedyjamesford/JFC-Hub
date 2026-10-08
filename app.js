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

async function jobsView(){
  header('PROJECT DELIVERY','Jobs & sites');

  const {data:jobList=[],error}=await db
    .from('jobs')
    .select('id,name,location,status,created_at')
    .order('name');

  if(error){
    $('#content').innerHTML='<div class="page"><div class="panel"><h3>Could not load jobs.</h3><p class="sub">Please try again.</p></div></div>';
    return;
  }

  $('#content').innerHTML=`
    <div class="page">
      <div class="topline">
        <div>
          <h3>Live jobs & sites</h3>
          <p class="section-intro">Jobs currently held in the JFC Hub.</p>
        </div>
      </div>

      <div class="card-row">
        ${jobList.length
          ? jobList.map(j=>`
            <article class="site-card">
              <div class="site-image">${j.name}</div>
              <div>
                <h3>${j.name}</h3>
                <p>⌖ ${j.location||'Location not set'}</p>
                <span class="pill ${j.status==='Planning'?'amber':''}">${String(j.status||'Active').toUpperCase()}</span>
              </div>
            </article>`).join('')
          : '<div class="panel"><p class="sub">No jobs have been added yet.</p></div>'}
      </div>
    </div>`;
}

async function photos(){
  header('SITE RECORDS','Site photos');

  const {data:photoList=[],error}=await db
    .from('job_sheet_photos')
    .select('id,job_sheet_id,file_name,file_path,created_at,staff_id')
    .order('created_at',{ascending:false})
    .limit(30);

  if(error){
    $('#content').innerHTML='<div class="page"><div class="panel"><h3>Could not load site photos.</h3><p class="sub">Please try again.</p></div></div>';
    return;
  }

  const {data:staff=[]}=await db.from('staff').select('id,full_name');
  const {data:jobs=[]}=await db.from('jobs').select('id,name');

  const cards=[];

  for(const p of photoList){
    const {data:signed}=await db.storage
      .from('job-sheet-photos')
      .createSignedUrl(p.file_path,3600);

    const {data:sheet}=await db
      .from('job_sheets')
      .select('job_id,work_date')
      .eq('id',p.job_sheet_id)
      .maybeSingle();

    cards.push({
      p,
      url:signed?.signedUrl,
      sheet,
      person:staff.find(s=>s.id===p.staff_id),
      job:jobs.find(j=>j.id===sheet?.job_id)
    });
  }

  $('#content').innerHTML=`
    <div class="page">
      <div class="topline">
        <div>
          <h3>Site photo log</h3>
          <p class="section-intro">Photos uploaded through submitted job sheets.</p>
        </div>
      </div>

      ${
        cards.length
        ? `<div class="card-row">
            ${cards.map(x=>`
              <article class="site-card">
                <div class="site-image" style="padding:0;overflow:hidden">
                  ${
                    x.url
                    ? `<img src="${x.url}" alt="Site photo" style="width:100%;height:180px;object-fit:cover">`
                    : 'PHOTO'
                  }
                </div>
                <div>
                  <h3>${x.job?.name||'Job site'}</h3>
                  <p>${x.sheet?.work_date||''} · ${x.person?.full_name||'Employee'}</p>
                  <small>${x.p.file_name}</small>
                </div>
              </article>
            `).join('')}
          </div>`
        : '<div class="panel"><p class="sub">No site photos have been uploaded yet.</p></div>'
      }
    </div>`;
}
function plant(){
  header('PLANT & FLEET','Plant checks & defects');

  $('#content').innerHTML=`
    <div class="page">
      <div class="topline">
        <div>
          <h3>Plant & defects</h3>
          <p class="section-intro">Digital plant inspections, vehicle checks and defect reporting.</p>
        </div>
      </div>

      <div class="grid cols-2" style="margin-top:18px">

        <div class="panel">
          <div class="panel-head"><h3>🚜 Plant inspection</h3></div>
          <p class="sub">Complete the daily and weekly checks for plant and machinery.</p>
          <button class="primary" style="margin-top:16px" onclick="plantInspection()">Start plant inspection</button>
        </div>

        <div class="panel">
          <div class="panel-head"><h3>🚗 Vehicle check</h3></div>
          <p class="sub">Complete the weekly driver vehicle check.</p>
          <button class="primary" style="margin-top:16px" onclick="vehicleInspection()">Start vehicle check</button>
        </div>

        <div class="panel">
          <div class="panel-head"><h3>⚠️ Report a defect</h3></div>
          <p class="sub">Report a fault, damage or safety issue immediately.</p>
          <button class="danger" style="margin-top:16px" onclick="reportDefect()">Report defect</button>
        </div>

        <div class="panel">
          <div class="panel-head"><h3>📋 Recent checks</h3></div>
          <div id="recentPlantChecks"><p class="sub">Loading recent checks...</p></div>
        </div>

      </div>
    </div>`;

  (async()=>{
    const [
      {data:plants=[]},
      {data:plantChecks=[]},
      {data:vehicleChecks=[]},
      {data:defects=[]}
    ]=await Promise.all([
      db.from('plant_assets').select('id,plant_number,make_model'),
      db.from('plant_checks').select('id,plant_id,check_date,status,created_at').order('created_at',{ascending:false}).limit(5),
      db.from('vehicle_checks').select('id,vehicle_reg,check_date,status,created_at').order('created_at',{ascending:false}).limit(5),
      db.from('plant_defects').select('id,vehicle_reg,category,description,status,reported_at').order('reported_at',{ascending:false}).limit(5)
    ]);

    const recent=[
      ...plantChecks.map(x=>({
        date:x.created_at||x.check_date,
        title:`🚜 ${plants.find(p=>p.id===x.plant_id)?.plant_number||'Plant check'}`,
        status:x.status
      })),
      ...vehicleChecks.map(x=>({
        date:x.created_at||x.check_date,
        title:`🚗 ${x.vehicle_reg||'Vehicle check'}`,
        status:x.status
      })),
      ...defects.map(x=>({
        date:x.reported_at,
        title:`⚠️ Defect — ${x.vehicle_reg||x.category||'Plant'}`,
        status:x.status
      }))
    ].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,8);

    $('#recentPlantChecks').innerHTML=recent.length
      ? recent.map(x=>`
        <div class="row" style="border-top:1px solid #edf0f3;padding:12px 0">
          <div class="grow">
            <b>${x.title}</b>
            <div class="sub">${new Date(x.date).toLocaleDateString('en-GB')}</div>
          </div>
          <span class="pill">${String(x.status||'submitted').toUpperCase()}</span>
        </div>`).join('')
      : '<p class="sub">No recent checks yet.</p>';
  })();
}
  async function plantInspection(){
const {data:assets=[]}=await db.from('plant_assets')
    .select('id,plant_number,make_model')
    .eq('active',true)
    .order('make_model');

  const daily=[
    'Engine oil level','Coolant level','Fuel tank top up',
    'Tyre inflation and condition','Brake performance',
    'Wheel studs / nuts tight','Engine stop device working',
    'Security of guards','Seat belt','Hitch / safety pin'
  ];

  const weekly=[
    'Oil leaks','Fuel leaks','Coolant leaks',
    'Any starting difficulties','Clutch operation','Grease all points',
    'Articulated joint / linkage underneath machine',
    'Brake fluid level','Brake fluid leaks','Foot brakes / hand brake',
    'Condition of tracks','Wear / cuts / blemishes',
    'Condition of steering wheel','Play on steering wheel',
    'Condition of pins and linkages','Cracks and damage',
    'Security of guards','Condition of step','Condition of skip / drum',
    'Condition of glass doors','Security of wiring',
    'Horn / wiper performance','Green / orange warning light',
    'Hydraulic oil leaks','Rams and pins condition',
    'Control lever condition','Hydraulic hoses',
    'Hydraulic oil level','Any other defects'
  ];

  const today=new Date().toISOString().split('T')[0];

  header('PLANT & FLEET','Plant inspection');

  $('#content').innerHTML=`
    <div class="page">
      <div class="topline">
        <div>
          <h3>Plant inspection</h3>
          <p class="section-intro">Tap ✓ OK, ✕ Defect or — N/A for each check.</p>
        </div>
        <button class="secondary" onclick="plant()">← Back</button>
      </div>

      <div class="panel">

        <div class="grid cols-2">
          <div>
            <label class="label">PLANT / MACHINE</label>
            <select id="plantAsset"
              style="width:100%;padding:11px;border:1px solid #d9e0e7;border-radius:6px;margin-top:6px">
              <option value="">Select plant</option>
              ${assets.map(a=>`
                <option value="${a.id}">
                  ${a.plant_number||'No number'} — ${a.make_model}
                </option>`).join('')}
            </select>
          </div>

          <div>
            <label class="label">DATE</label>
            <input id="plantCheckDate" type="date" value="${today}"
              style="width:100%;padding:11px;border:1px solid #d9e0e7;border-radius:6px;margin-top:6px">
          </div>
        </div>

        <div style="margin-top:25px">
          <h3>Daily checks</h3>

          ${daily.map((item,i)=>`
            <div class="row" style="gap:10px;border-top:1px solid #edf0f3;padding:12px 0">
              <div class="grow"><b>${item}</b></div>
              <select class="plantDaily" data-i="${i}"
                style="width:115px;padding:8px;border:1px solid #d9e0e7;border-radius:6px">
                <option value="">Choose</option>
                <option value="ok">✓ OK</option>
                <option value="defect">✕ Defect</option>
                <option value="na">— N/A</option>
              </select>
            </div>`).join('')}
        </div>

        <div style="margin-top:25px">
          <h3>Weekly checks</h3>

          ${weekly.map((item,i)=>`
            <div class="row" style="gap:10px;border-top:1px solid #edf0f3;padding:12px 0">
              <div class="grow"><b>${item}</b></div>
              <select class="plantWeekly" data-i="${i}"
                style="width:115px;padding:8px;border:1px solid #d9e0e7;border-radius:6px">
                <option value="">Choose</option>
                <option value="ok">✓ OK</option>
                <option value="defect">✕ Defect</option>
                <option value="na">— N/A</option>
              </select>
            </div>`).join('')}
        </div>

        <div style="margin-top:25px">
          <label class="quick">
            <input id="plantSafety" type="checkbox">
            <b>Safety hazard</b>
            <small>Could this make the machine unsafe?</small>
          </label>

          <label class="quick" style="margin-top:10px">
            <input id="plantRepair" type="checkbox">
            <b>Immediate repair required</b>
            <small>Machine should not be used until cleared.</small>
          </label>
        </div>

        <div style="margin-top:20px">
          <label class="label">NOTES / DEFECT DETAILS</label>
          <textarea id="plantNotes" rows="4"
            placeholder="Record any defects or observations..."
            style="width:100%;padding:11px;border:1px solid #d9e0e7;border-radius:6px;margin-top:6px"></textarea>
        </div>

        <button id="savePlantCheck" class="primary" style="margin-top:22px">
          Submit inspection
        </button>

      </div>
    </div>`;

  $('#savePlantCheck').onclick=async()=>{
    const plantId=$('#plantAsset').value;

    if(!plantId){
      toast('Please select the plant / machine');
      return;
    }

    const {data:{user:authUser}}=await db.auth.getUser();
    const {data:person}=await db.from('staff')
      .select('id')
      .eq('auth_user_id',authUser.id)
      .single();

    const dailyResults={};
    document.querySelectorAll('.plantDaily').forEach((el,i)=>{
      dailyResults[daily[i]]=el.value;
    });

    const weeklyResults={};
    document.querySelectorAll('.plantWeekly').forEach((el,i)=>{
      weeklyResults[weekly[i]]=el.value;
    });

    const hasDefect=[
      ...Object.values(dailyResults),
      ...Object.values(weeklyResults)
    ].includes('defect');

    const safety=$('#plantSafety').checked;
    const repair=$('#plantRepair').checked;

    const {error}=await db.from('plant_checks').insert({
      plant_id:plantId,
      staff_id:person.id,
      check_date:$('#plantCheckDate').value,
      daily_checks:dailyResults,
      weekly_checks:weeklyResults,
      notes:$('#plantNotes').value.trim(),
      safety_hazard:safety,
      requires_repair:repair,
      status:(hasDefect||safety||repair)?'action':'passed'
    });

    if(error){
      console.error(error);
      toast('Could not save inspection');
      return;
    }

    toast('Plant inspection submitted');
    setTimeout(()=>plant(),1000);
  };
}

async function vehicleInspection(){
  const {data:vehicles=[]}=await db.from('vehicle_assets')
    .select('id,fleet_number,vehicle_name,registration,mot_due,assigned_to')
    .eq('active',true)
    .order('fleet_number');

  const checks=[
    'Lights including brake / reverse',
    'Engine oil / water / fuel / screenwash levels',
    'Exhaust condition / smoke / emissions',
    'Reflectors / markers / warning devices',
    'Tyres inflation / damage / wear',
    'Battery security / condition',
    'Wheels condition / security',
    'Wheel nut indicators aligned (if fitted)',
    'Load security',
    'Mirrors condition / security',
    'Load door locked / secure',
    'Body lowered / PTO lock disengaged (if fitted)',
    'Spray suppression condition',
    'Body / wings damage and condition',
    'Windscreen / glass condition',
    'Driving controls / steering',
    'Brakes including ABS',
    'Warning lights',
    'Speed limiter operation',
    'Horn / wipers / washers',
    'Rear view camera operation / visibility'
  ];

  const today=new Date().toISOString().split('T')[0];

  header('PLANT & FLEET','Vehicle weekly check');

  $('#content').innerHTML=`
    <div class="page">
      <div class="topline">
        <div>
          <h3>Vehicle weekly check</h3>
          <p class="section-intro">Complete the weekly vehicle checks.</p>
        </div>
        <button class="secondary" onclick="plant()">← Back</button>
      </div>

      <div class="panel">
        <div class="grid cols-2">
          <div>
            <label class="label">VEHICLE</label>
            <select id="vehicleAsset" style="width:100%;padding:11px;border:1px solid #d9e0e7;border-radius:6px;margin-top:6px">
              <option value="">Select vehicle</option>
              ${vehicles.map(v=>`
                <option value="${v.id}">
                  ${v.fleet_number} — ${v.vehicle_name}${v.registration ? ' — '+v.registration : ''}
                </option>`).join('')}
            </select>
          </div>

          <div>
            <label class="label">DATE</label>
            <input id="vehicleDate" type="date" value="${today}" style="width:100%;padding:11px;border:1px solid #d9e0e7;border-radius:6px;margin-top:6px">
          </div>

          <div>
            <label class="label">DRIVER</label>
            <input id="vehicleDriver" type="text" placeholder="Driver name" style="width:100%;padding:11px;border:1px solid #d9e0e7;border-radius:6px;margin-top:6px">
          </div>

          <div>
            <label class="label">MILEAGE</label>
            <input id="vehicleMileage" type="number" min="0" placeholder="Current mileage" style="width:100%;padding:11px;border:1px solid #d9e0e7;border-radius:6px;margin-top:6px">
          </div>
        </div>

        <div style="margin-top:25px">
          <h3>Vehicle checks</h3>
          ${checks.map((item,i)=>`
            <div class="row" style="gap:10px;border-top:1px solid #edf0f3;padding:12px 0">
              <div class="grow"><b>${item}</b></div>
              <select class="vehicleCheck" data-i="${i}" style="width:115px;padding:8px;border:1px solid #d9e0e7;border-radius:6px">
                <option value="">Choose</option>
                <option value="ok">✓ OK</option>
                <option value="defect">✕ Defect</option>
                <option value="na">— N/A</option>
              </select>
            </div>`).join('')}
        </div>

       <div id="vehicleDefectPanel" class="panel" style="display:none;margin-top:22px;border-left:4px solid #d24b4b">
  <h3>⚠️ Defect reported</h3>
  <p class="section-intro">Complete the action required for the defect before submitting the check.</p>

  <div id="vehicleDefectList" style="margin-top:12px"></div>

  <div class="grid cols-2" style="margin-top:16px">
    <label class="quick">
      <input id="vehicleSafetyHazard" type="checkbox">
      <b>Safety hazard</b>
      <small>Could this defect make the vehicle unsafe?</small>
    </label>

    <label class="quick">
      <input id="vehicleImmediateRepair" type="checkbox">
      <b>Immediate repair required</b>
      <small>Does the vehicle need repair before normal use?</small>
    </label>
  </div>

  <label class="quick" style="margin-top:10px">
    <input id="vehicleRemoveFromUse" type="checkbox">
    <b>🚫 Remove vehicle from use</b>
    <small>Vehicle must not be used until a supervisor clears it.</small>
  </label>
</div>

<div style="margin-top:22px">
  <label class="label">COMMENTS / DEFECTS</label>
  <textarea id="vehicleComments" rows="5" placeholder="Record any defects, comments or action required..." style="width:100%;padding:11px;border:1px solid #d9e0e7;border-radius:6px;margin-top:6px"></textarea>
</div>


        <button id="saveVehicleCheck" class="primary" style="margin-top:22px">
          Submit vehicle check
        </button>
      </div>
    </div>`;

  $('#saveVehicleCheck').onclick=async()=>{
    const vehicleId=$('#vehicleAsset').value;

    if(!vehicleId){
      toast('Please select a vehicle');
      return;
    }

    const {data:{user:authUser}}=await db.auth.getUser();

    const {data:person,error:personError}=await db.from('staff')
      .select('id,full_name')
      .eq('auth_user_id',authUser.id)
      .single();

    if(personError||!person){
      toast('Staff record not found');
      return;
    }

    const selectedVehicle=vehicles.find(v=>v.id===vehicleId);
    const results={};

    document.querySelectorAll('.vehicleCheck').forEach((el,i)=>{
      results[checks[i]]=el.value;
    });

    const hasDefect=Object.values(results).includes('defect');

    const {error}=await db.from('vehicle_checks').insert({
      vehicle_reg:selectedVehicle?.registration||selectedVehicle?.fleet_number||'',
      driver_name:$('#vehicleDriver').value.trim()||person.full_name,
      staff_id:person.id,
      check_date:$('#vehicleDate').value,
      mileage:Number($('#vehicleMileage').value)||null,
      checks:results,
      comments:$('#vehicleComments').value.trim(),
      status:hasDefect?'defect':'passed'
    });

    if(error){
      console.error(error);
      toast('Could not save vehicle check');
      return;
    }

    toast(hasDefect?'Vehicle check submitted with defect':'Vehicle check submitted');
    setTimeout(()=>plant(),1000);
  };
}

async function farmFleet(){
  const {data:fleet=[]}=await db.from('farm_assets')
    .select('fleet_number,vehicle_name,year_or_number')
    .eq('active',true)
    .order('fleet_number');

  header('PLANT & FLEET','Farm fleet');

  $('#content').innerHTML=`
    <div class="page">
      <div class="topline">
        <div>
          <h3>🚜 Farm fleet</h3>
          <p class="section-intro">JFF farm machinery and equipment.</p>
        </div>
        <button class="secondary" onclick="plant()">← Back</button>
      </div>

      <div class="panel">
        ${fleet.map(item=>`
          <div class="row" style="border-top:1px solid #edf0f3;padding:14px 0">
            <div class="grow">
              <b>${item.fleet_number} — ${item.vehicle_name}</b>
              <div class="sub">${item.year_or_number||'Details to be added'}</div>
            </div>
            <span class="pill">JFF</span>
          </div>`).join('')}
      </div>
    </div>`;
}
async function reportDefect(){
  const {data:assets=[]}=await db.from('plant_assets')
    .select('id,plant_number,make_model')
    .eq('active',true)
    .order('make_model');

  header('PLANT & FLEET','Report a defect');

  $('#content').innerHTML=`
    <div class="page">
      <div class="topline">
        <div>
          <h3>⚠️ Report a defect</h3>
          <p class="section-intro">
            If a defect is a safety issue, stop using the machine and contact a supervisor.
          </p>
        </div>
        <button class="secondary" onclick="plant()">← Back</button>
      </div>

      <div class="panel">

        <label class="label">PLANT / MACHINE</label>

        <select id="defectPlant"
          style="width:100%;padding:11px;border:1px solid #d9e0e7;border-radius:6px;margin-top:6px">

          <option value="">Select plant</option>

          ${assets.map(a=>`
            <option value="${a.id}">
              ${a.plant_number||'No number'} — ${a.make_model}
            </option>`).join('')}

        </select>

        <label class="label" style="display:block;margin-top:20px">
          CATEGORY
        </label>

        <select id="defectCategory"
          style="width:100%;padding:11px;border:1px solid #d9e0e7;border-radius:6px;margin-top:6px">

          <option>Engine</option>
          <option>Brakes</option>
          <option>Tyres / tracks</option>
          <option>Steering</option>
          <option>Hydraulics</option>
          <option>Electrics</option>
          <option>Body / glass</option>
          <option>Safety equipment</option>
          <option>Other</option>

        </select>

        <label class="label" style="display:block;margin-top:20px">
          WHAT IS WRONG?
        </label>

        <textarea id="defectDescription" rows="6"
          placeholder="Describe the fault..."
          style="width:100%;padding:11px;border:1px solid #d9e0e7;border-radius:6px;margin-top:6px"></textarea>

        <label class="quick" style="margin-top:20px">
          <input id="defectSafety" type="checkbox">
          <b>Safety hazard</b>
          <small>This could make the machine unsafe.</small>
        </label>

        <label class="quick" style="margin-top:10px">
          <input id="defectImmediate" type="checkbox">
          <b>Remove from use</b>
          <small>The machine should not be used until repaired.</small>
        </label>

        <button id="saveDefect" class="danger" style="margin-top:22px">
          Report defect
        </button>

      </div>
    </div>`;

  $('#saveDefect').onclick=async()=>{
    const description=$('#defectDescription').value.trim();

    if(!description){
      toast('Please describe the defect');
      return;
    }

    const {data:{user:authUser}}=await db.auth.getUser();

    const {data:person}=await db.from('staff')
      .select('id')
      .eq('auth_user_id',authUser.id)
      .single();

    const {error}=await db.from('plant_defects').insert({
      plant_id:$('#defectPlant').value||null,
      staff_id:person.id,
      category:$('#defectCategory').value,
      description:description,
      safety_hazard:$('#defectSafety').checked,
      requires_immediate_repair:$('#defectImmediate').checked,
      status:'open'
    });

    if(error){
      console.error(error);
      toast('Could not report defect');
      return;
    }

    toast('Defect reported');
    setTimeout(()=>plant(),1000);
  };
}

function docs(){
  header('COMPLIANCE LIBRARY','RAMS & documents');

  $('#content').innerHTML=`
    <div class="page">
      <div class="topline">
        <div>
          <h3>JFC document library</h3>
          <p class="section-intro">Approved RAMS, policies, COSHH assessments, permits and site documents.</p>
        </div>
      </div>

      <div class="panel">
        <h3>Document library ready</h3>
        <p class="section-intro">
          This library is ready for the real JFC documents. The previous documents were demonstration content, so they have been removed rather than showing staff documents that do not actually exist in the Hub.
        </p>

        <div class="tool-grid" style="margin-top:18px">
          <article class="tool-card">
            <div class="tool-icon">▤</div>
            <h3>RAMS</h3>
            <p>Risk assessments and method statements.</p>
          </article>

          <article class="tool-card">
            <div class="tool-icon">✓</div>
            <h3>Health & Safety</h3>
            <p>Company policies and safety procedures.</p>
          </article>

          <article class="tool-card">
            <div class="tool-icon">◫</div>
            <h3>COSHH</h3>
            <p>COSHH assessments and related records.</p>
          </article>

          <article class="tool-card">
            <div class="tool-icon">⚠</div>
            <h3>Permits & site packs</h3>
            <p>Site-specific controlled documents.</p>
          </article>
        </div>

        <p class="sub" style="margin-top:18px">
          Once you have the real PDFs, we can add them here so the team can open the current approved version from the Hub.
        </p>
      </div>
    </div>`;
}

async function viewJobSheet(id){
  const { data:sheet, error } = await db
    .from('job_sheets')
    .select('id,job_id,staff_id,work_date,work_carried_out,materials_used,plant_used,issues,hours_on_site,notes,status')
    .eq('id',id)
    .single();

  if(error || !sheet){
    toast('Could not load job sheet');
    return;
  }

  const { data:job } = await db
    .from('jobs')
    .select('name')
    .eq('id',sheet.job_id)
    .maybeSingle();

  const { data:person } = await db
    .from('staff')
    .select('full_name')
    .eq('id',sheet.staff_id)
    .maybeSingle();

  const { data:photos=[] } = await db
  .from('job_sheet_photos')
  .select('file_path,file_name')
  .eq('job_sheet_id',id)
  .order('created_at');

let photoUrls=[];

if(photos.length){
  const { data:signed } = await db.storage
    .from('job-sheet-photos')
    .createSignedUrls(
      photos.map(p=>p.file_path),
      3600
    );

  photoUrls=signed || [];
}

  header('SITE RECORDS','Job sheet details');

  $('#content').innerHTML=`
    <div class="page">
      <div class="topline">
        <div>
          <h3>${job?.name || 'Job sheet'}</h3>
          <p class="section-intro">${sheet.work_date} · ${person?.full_name || 'Employee'}</p>
        </div>
        <button class="btn" onclick="reports()">← Back</button>
      </div>

      <div class="panel">
        <p><b>Hours on site:</b> ${sheet.hours_on_site || 0}</p>
        <p><b>Work carried out:</b><br>${sheet.work_carried_out || '—'}</p>
        <p><b>Materials used:</b><br>${sheet.materials_used || '—'}</p>
        <p><b>Plant / machinery:</b><br>${sheet.plant_used || '—'}</p>
        <p><b>Problems / issues:</b><br>${sheet.issues || '—'}</p>
        <p><b>Additional notes:</b><br>${sheet.notes || '—'}</p>
        ${photoUrls.length ? `
  <div style="margin-top:20px">
    <p><b>Site photos:</b></p>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-top:10px">
      ${photoUrls.map(p=>`
        <img src="${p.signedUrl}" alt="Site photo" style="width:100%;height:180px;object-fit:cover;border-radius:8px">
      `).join('')}
    </div>
  </div>
` : ''}

      </div>
    </div>
  `;
}

async function reports(){
  header('SITE RECORDS','Daily reports');

  const {data:{user:authUser}}=await db.auth.getUser();

  if(!authUser){
    $('#content').innerHTML='<div class="page"><div class="panel"><h3>Please sign in again.</h3></div></div>';
    return;
  }

  const {data:staff}=await db
    .from('staff')
    .select('*')
    .eq('auth_user_id',authUser.id)
    .single();

  if(!staff){
    $('#content').innerHTML='<div class="page"><div class="panel"><h3>Staff record not found.</h3></div></div>';
    return;
  }

  const {data:jobList=[]}=await db
    .from('jobs')
    .select('id,name')
    .eq('status','Active')
    .order('name');

  const {data:submittedSheets=[]}=await db
    .from('job_sheets')
    .select('id,job_id,staff_id,work_date,work_carried_out,materials_used,plant_used,issues,hours_on_site,notes,status')
    .order('work_date',{ascending:false})
    .limit(50);

  const {data:allJobs=[]}=await db
    .from('jobs')
    .select('id,name');

  const {data:allStaff=[]}=await db
    .from('staff')
    .select('id,full_name');

  const today=new Date();
  const todayString=
    today.getFullYear()+'-'+
    String(today.getMonth()+1).padStart(2,'0')+'-'+
    String(today.getDate()).padStart(2,'0');

  const todaySheets=submittedSheets.filter(s=>s.work_date===todayString);

  const todayHours=todaySheets.reduce(
    (total,s)=>total+(Number(s.hours_on_site)||0),0
  );

  const todaySites=new Set(
    todaySheets.map(s=>s.job_id)
  ).size;

  $('#content').innerHTML=`
    <div class="page">

      <div class="topline">
        <div>
          <h3>Daily reports</h3>
          <p class="section-intro">
            Live site reports submitted through the JFC Hub.
          </p>
        </div>
      </div>

      <section class="stats">

        <div class="stat">
          <span class="label">TODAY'S REPORTS</span>
          <strong>${todaySheets.length}</strong>
          <span class="trend">Submitted today</span>
        </div>

        <div class="stat">
          <span class="label">HOURS TODAY</span>
          <strong>${todayHours}</strong>
          <span class="trend">Hours recorded</span>
        </div>

        <div class="stat">
          <span class="label">SITES REPORTED</span>
          <strong>${todaySites}</strong>
          <span class="trend">Active sites today</span>
        </div>

        <div class="stat">
          <span class="label">TOTAL REPORTS</span>
          <strong>${submittedSheets.length}</strong>
          <span class="trend">Recent Hub records</span>
        </div>

      </section>

      <div class="panel" style="margin-bottom:20px">

        <div class="topline">
          <div>
            <h3>Recent submitted reports</h3>
            <p class="section-intro">
              Click a report to view the full site record.
            </p>
          </div>

          <span class="pill">${submittedSheets.length}</span>
        </div>

        ${
          submittedSheets.length
          ?
          submittedSheets.map(sheet=>`

            <div
              class="row"
              onclick="viewJobSheet('${sheet.id}')"
              style="padding:14px 0;border-top:1px solid #edf0f3;cursor:pointer"
            >

              <div class="grow">

                <b>
                  ${
                    allJobs.find(j=>j.id===sheet.job_id)?.name
                    || 'Job'
                  }
                </b>

                <div class="sub">
                  ${sheet.work_date}
                  ·
                  ${
                    allStaff.find(s=>s.id===sheet.staff_id)?.full_name
                    || 'Employee'
                  }
                  ·
                  ${sheet.hours_on_site||0} hrs
                </div>

                <div class="sub" style="margin-top:5px">
                  ${sheet.work_carried_out||''}
                </div>

              </div>

              <span class="pill">
                ${String(sheet.status||'submitted').toUpperCase()}
              </span>

            </div>

          `).join('')

          :

          `<p class="sub">No submitted job reports yet.</p>`
        }

      </div>

      <div class="topline">

        <div>
          <h3>New daily report</h3>
          <p class="section-intro">
            Record the work completed on site today.
          </p>
        </div>

        <span class="pill">DRAFT</span>

      </div>

      <div class="panel">

        <div class="grid cols-2">

          <div>
            <label class="label">JOB / SITE</label>

            <select
              id="jobSheetJob"
              style="width:100%;padding:11px;border:1px solid #d9e0e7;border-radius:6px;margin-top:6px"
            >

              <option value="">Select job / site</option>

              ${
                jobList.map(j=>
                  `<option value="${j.id}">${j.name}</option>`
                ).join('')
              }

            </select>
          </div>

          <div>
            <label class="label">DATE</label>

            <input
              id="jobSheetDate"
              type="date"
              value="${todayString}"
              style="width:100%;padding:11px;border:1px solid #d9e0e7;border-radius:6px;margin-top:6px"
            >
          </div>

          <div>
            <label class="label">EMPLOYEE</label>

            <input
              type="text"
              value="${staff.full_name}"
              disabled
              style="width:100%;padding:11px;border:1px solid #d9e0e7;border-radius:6px;margin-top:6px;background:#f5f7f9"
            >
          </div>

          <div>
            <label class="label">HOURS ON SITE</label>

            <input
              id="jobSheetHours"
              type="number"
              min="0"
              max="24"
              step="0.5"
              placeholder="e.g. 8"
              style="width:100%;padding:11px;border:1px solid #d9e0e7;border-radius:6px;margin-top:6px"
            >
          </div>

        </div>

        <div style="margin-top:20px">
          <label class="label">WORK CARRIED OUT</label>

          <textarea
            id="jobSheetWork"
            rows="5"
            placeholder="Describe the work completed today..."
            style="width:100%;padding:11px;border:1px solid #d9e0e7;border-radius:6px;margin-top:6px;resize:vertical"
          ></textarea>
        </div>

        <div style="margin-top:20px">
          <label class="label">MATERIALS USED</label>

          <textarea
            id="jobSheetMaterials"
            rows="3"
            placeholder="List materials used today..."
            style="width:100%;padding:11px;border:1px solid #d9e0e7;border-radius:6px;margin-top:6px;resize:vertical"
          ></textarea>
        </div>

        <div style="margin-top:20px">
          <label class="label">PLANT / MACHINERY USED</label>

          <textarea
            id="jobSheetPlant"
            rows="3"
            placeholder="List plant or machinery used..."
            style="width:100%;padding:11px;border:1px solid #d9e0e7;border-radius:6px;margin-top:6px;resize:vertical"
          ></textarea>
        </div>

        <div style="margin-top:20px">
          <label class="label">PROBLEMS / ISSUES</label>

          <textarea
            id="jobSheetIssues"
            rows="3"
            placeholder="Any problems, delays or issues?"
            style="width:100%;padding:11px;border:1px solid #d9e0e7;border-radius:6px;margin-top:6px;resize:vertical"
          ></textarea>
        </div>

        <div style="margin-top:20px">
          <label class="label">ADDITIONAL NOTES</label>

          <textarea
            id="jobSheetNotes"
            rows="3"
            placeholder="Anything else to record..."
            style="width:100%;padding:11px;border:1px solid #d9e0e7;border-radius:6px;margin-top:6px;resize:vertical"
          ></textarea>
        </div>

        <div style="margin-top:20px">

          <label class="label">SITE PHOTOS</label>

          <input
            id="jobSheetPhotos"
            type="file"
            accept="image/*"
            multiple
            capture="environment"
            style="width:100%;padding:11px;border:1px solid #d9e0e7;border-radius:6px;margin-top:6px"
          >

          <p class="sub" style="margin-top:6px">
            Add photos showing today's work or site progress.
          </p>

        </div>

        <div style="display:flex;justify-content:flex-end;margin-top:24px">

          <button id="submitJobSheet" class="primary">
            Submit daily report
          </button>

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

    const {data:savedSheet,error}=await db
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
      })
      .select()
      .single();

    if(error){
      console.error(error);
      toast('Could not submit daily report');
      return;
    }

    const photoFiles=$('#jobSheetPhotos')?.files||[];

    for(const file of photoFiles){

      const safeName=file.name.replace(
        /[^a-zA-Z0-9._-]/g,
        '_'
      );

      const filePath=
        `${savedSheet.id}/${Date.now()}-${safeName}`;

      const {error:uploadError}=await db.storage
        .from('job-sheet-photos')
        .upload(
          filePath,
          file,
          {
            contentType:file.type,
            upsert:false
          }
        );

      if(uploadError){
        console.error(uploadError);
        toast('Photo upload failed: '+uploadError.message);
      }

      await db
        .from('job_sheet_photos')
        .insert({
          job_sheet_id:savedSheet.id,
          staff_id:staff.id,
          file_path:filePath,
          file_name:file.name
        });
    }

    toast('Daily report submitted');

    setTimeout(()=>reports(),1500);
  };
}

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
const { data:submittedSheets=[] } = await db
  .from('job_sheets')
  .select('id,job_id,staff_id,work_date,work_carried_out,materials_used,plant_used,issues,hours_on_site,notes,status')
  .order('work_date',{ascending:false})
  .limit(20);
  const { data:allJobs=[] } = await db
  .from('jobs')
  .select('id,name');

const { data:allStaff=[] } = await db
  .from('staff')
  .select('id,full_name');

  const today=new Date().toISOString().split('T')[0];

  $('#content').innerHTML=`
    <div class="page">
      
      <div class="panel" style="margin-bottom:20px">
  <div class="topline">
    <div>
      <h3>Submitted job sheets</h3>
      <p class="section-intro">Recently completed site records.</p>
    </div>
    <span class="pill">${submittedSheets.length}</span>
  </div>

  ${submittedSheets.length ? submittedSheets.map(sheet=>`
    <div class="row" onclick="viewJobSheet('${sheet.id}')" style="padding:14px 0;border-top:1px solid #edf0f3;cursor:pointer">
      <div class="grow">
        <b>${allJobs.find(j=>j.id===sheet.job_id)?.name || 'Job'}</b>
        <div class="sub">${sheet.work_date} · ${allStaff.find(s=>s.id===sheet.staff_id)?.full_name || 'Employee'} · ${sheet.hours_on_site || 0} hrs</div>
        <div class="sub" style="margin-top:5px">${sheet.work_carried_out || ''}</div>
      </div>
      <span class="pill">${sheet.status}</span>
    </div>
  `).join('') : `
    <p class="sub">No submitted job sheets yet.</p>
  `}
</div>

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

        <div style="margin-top:20px">
  <label class="label">SITE PHOTOS</label>
  <input id="jobSheetPhotos" type="file" accept="image/*" multiple capture="environment" style="width:100%;padding:11px;border:1px solid #d9e0e7;border-radius:6px;margin-top:6px">
  <p class="sub" style="margin-top:6px">Add photos showing today's work or site progress.</p> </div>

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

    const { data: savedSheet, error }=await db
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
      }).select().single();

    if(error){
      toast('Could not submit job sheet');
      return;
    }

    const photoFiles=$('#jobSheetPhotos')?.files || [];

for(const file of photoFiles){
  const safeName=file.name.replace(/[^a-zA-Z0-9._-]/g,'_');
  const filePath=`${savedSheet.id}/${Date.now()}-${safeName}`;

  const { error:uploadError }=await db.storage
    .from('job-sheet-photos')
    .upload(filePath,file,{
      contentType:file.type,
      upsert:false
    });

  if(uploadError){
    console.error(uploadError);
    toast('Photo upload failed: ' + uploadError.message);
  }

  await db.from('job_sheet_photos').insert({
    job_sheet_id:savedSheet.id,
    staff_id:staff.id,
    file_path:filePath,
    file_name:file.name
  });
}

    toast('Job sheet submitted');
    setTimeout(()=>reports(),2500);
  };
}

async function management(){
  header('MANAGEMENT OVERVIEW','Company overview');

  const [
    {data:staff=[]},
    {data:jobs=[]},
    {data:checks=[]},
    {data:defects=[]}
  ] = await Promise.all([
    db.from('staff').select('full_name,job_title,role,active').eq('active',true).order('full_name'),
    db.from('jobs').select('name,status').order('name'),
    db.from('plant_checks').select('id,status,created_at').order('created_at',{ascending:false}).limit(100),
    db.from('plant_defects').select('id,status,reported_at').order('reported_at',{ascending:false}).limit(100)
  ]);

  const openDefects=defects.filter(d=>d.status==='open').length;
  const passedChecks=checks.filter(c=>c.status==='passed').length;

  $('#content').innerHTML=`
    <div class="page">

      <section class="stats">

        <div class="stat">
          <span class="label">ACTIVE STAFF</span>
          <strong>${staff.length}</strong>
          <span class="trend">Live staff records</span>
        </div>

        <div class="stat">
          <span class="label">LIVE JOBS</span>
          <strong>${jobs.length}</strong>
          <span class="trend">Jobs in the Hub</span>
        </div>

        <div class="stat">
          <span class="label">OPEN DEFECTS</span>
          <strong>${openDefects}</strong>
          <span class="trend">Plant & fleet</span>
        </div>

        <div class="stat">
          <span class="label">PASSED CHECKS</span>
          <strong>${passedChecks}</strong>
          <span class="trend">Recorded in the Hub</span>
        </div>

      </section>

      <div class="grid cols-2">

        <div class="panel">
          <h3>Live jobs</h3>

          <div class="list">
            ${
              jobs.length
              ? jobs.map(j=>`
                <div class="row">
                  <div class="grow">
                    <b>${j.name}</b>
                  </div>
                  <span class="pill">${String(j.status||'ACTIVE').toUpperCase()}</span>
                </div>
              `).join('')
              : '<p class="sub">No jobs have been added yet.</p>'
            }
          </div>
        </div>

        <div class="panel">
          <h3>Company team</h3>

          <div class="where">
            ${
              staff.map(s=>`
                <div class="where-item">
                  <div class="avatar">${initials(s.full_name)}</div>
                  <div>
                    <b>${s.full_name}</b>
                    <div class="sub">${s.job_title||s.role}</div>
                  </div>
                  <span class="pill">${String(s.role||'STAFF').toUpperCase()}</span>
                </div>
              `).join('')
            }
          </div>
        </div>

      </div>
    </div>`;
}

async function social(){
  header('MARKETING DESK','Social media content');

  const {data:jobs=[]}=await db
    .from('jobs')
    .select('id,name,status')
    .order('name');

  const {data:photoList=[]}=await db
    .from('job_sheet_photos')
    .select('id,file_name,created_at')
    .order('created_at',{ascending:false})
    .limit(10);

  $('#content').innerHTML=`
    <div class="page">

      <div class="topline">
        <div>
          <h3>JFC content planner</h3>
          <p class="section-intro">
            Create professional, on-brand content from what's actually happening across JFC.
          </p>
        </div>
      </div>

      <div class="grid cols-2">

        <div class="panel">
          <h3>Write a post</h3>

          <label>Choose a job</label>
          <select id="socialJob" style="margin-bottom:14px">
            <option value="">Select a job</option>
            ${
              jobs.map(j=>`
                <option value="${j.name}">${j.name}</option>
              `).join('')
            }
          </select>

          <label>Post content</label>
          <textarea
            id="socialText"
            rows="9"
            placeholder="Write your JFC update here..."
            style="width:100%;margin-top:6px"
          ></textarea>

          <div class="modal-actions" style="margin-top:14px">
            <button class="secondary" onclick="toast('Draft kept on screen')">
              Keep as draft
            </button>
            <button class="primary" onclick="toast('Ready to copy into Instagram or Facebook')">
              Ready to post
            </button>
          </div>
        </div>

        <div class="panel">
          <h3>Live content opportunities</h3>

          <div class="list">

            <div class="row">
              <span class="row-icon">⌑</span>
              <div class="grow">
                <b>${jobs.length} live jobs</b>
                <div class="sub">Choose a current JFC site for your next update.</div>
              </div>
            </div>

            <div class="row">
              <span class="row-icon">▣</span>
              <div class="grow">
                <b>${photoList.length} recent site photos</b>
                <div class="sub">Photos uploaded through job sheets.</div>
              </div>
              <button class="link" onclick="go('photos')">View</button>
            </div>

            <div class="row">
              <span class="row-icon">✓</span>
              <div class="grow">
                <b>Team & safety content</b>
                <div class="sub">Share training, machinery, site progress and team moments.</div>
              </div>
            </div>

          </div>
        </div>

      </div>

      <div class="panel" style="margin-top:18px">
        <h3>Easy JFC content ideas</h3>

        <div class="tool-grid">
          <article class="tool-card">
            <div class="tool-icon">📸</div>
            <h3>Site progress</h3>
            <p>Show what the team has achieved this week.</p>
          </article>

          <article class="tool-card">
            <div class="tool-icon">🚜</div>
            <h3>Plant & machinery</h3>
            <p>Showcase the kit working across your sites.</p>
          </article>

          <article class="tool-card">
            <div class="tool-icon">👷</div>
            <h3>Meet the team</h3>
            <p>Put the people behind JFC at the centre of the story.</p>
          </article>

          <article class="tool-card">
            <div class="tool-icon">🦺</div>
            <h3>Safety & training</h3>
            <p>Share the work that keeps the team safe.</p>
          </article>
        </div>
      </div>

    </div>`;
}


function toast(message){
  const t=$('#toast');
  if(!t)return;
  t.textContent=message;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2500);
}

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
