const SUPABASE_URL = "https://nkcngzsjevgzurwxkjqn.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rY25nenNqZXZnenVyd3hranFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3NTQyMTEsImV4cCI6MjEwMTMzMDIxMX0.2UlqfEPT-TCBGnIfHqn1sArX1AOkhRr6zvnQt4evD0U";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let CloudClusterValidationConfig = {}; // تعريف متغير القواعد السحابية العلوي
let globalStaffDatabase = []; // مصفوفة الكوادر الأساسية

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('accessPasscode');
    const eyeIcon = document.getElementById('eyeIcon');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text'; eyeIcon.textContent = '🙈';
    } else {
        passwordInput.type = 'password'; eyeIcon.textContent = '👁️';
    }
}

function handleEnterKey(event) {
    if (event.key === 'Enter') { authenticateUserGateway(); }
}

// ✅ ضع هذه الدالة المصلحة والمربوطة بالسحاب مكانها:
async function authenticateUserGateway() {
    const passcode = document.getElementById('accessPasscode').value;
    
    // 🟢 1. الدخول الخاص بك (المدير العام) عند كتابة رمك السري
    if (passcode === "Admin@123456") {
        document.getElementById('gatekeeperSystem').style.display = 'none'; // إخفاء شاشة الدخول
        document.getElementById('leaderPlatform').style.display = 'none';    // إخفاء منصة رئيس التكتل (سرّي)
        document.getElementById('adminPlatform').style.display = 'block';    // إظهار لوحة تحكم الإدارة الخاصة بك فقط
        
        await loadApprovedClustersListForAdmin(); // جلب التشكيلات المرفوعة لك من السحاب فوراً
    } 
    
    // 🔵 2. الدخول الخاص برئيس التكتل عند كتابة الرمز المخصص لهم
    else if (passcode === "LeaderHajj@123") { 
        document.getElementById('gatekeeperSystem').style.display = 'none'; // إخفاء شاشة الدخول
        document.getElementById('adminPlatform').style.display = 'none';     // إخفاء لوحة الإدارة العامة (سرّي)
        document.getElementById('leaderPlatform').style.display = 'block';   // إظهار منصة التعبئة الخاصة به فقط
        
        // جلب الضوابط والشروط واستعادة حالة العمل الخاصة برئيس التكتل
        await fetchValidationRulesFromCloud();
        await loadInitialStaffFromCloud();
        loadStateFromLocalStorage();
    } 
    
    // ❌ 3. في حال إدخال رمز خاطئ
    else {
        alert("رمز الصلاحية المعتمد غير صحيح لولايات المنظومة الرقمية السورية!");
    }
}





// 🌟 تأمين الذاكرة وحفظ كادر المجموعات حصرياً سحابياً
if (typeof globalGroupsDatabase === 'undefined') {
    var globalGroupsDatabase = [];
}

// ⚡ دالة الجلب الأصلية المعتمدة مدمج بداخلها جدول التكتلات وجدول المجموعات معاً
async function loadInitialStaffFromCloud() {
    const statusLog = document.getElementById('adminStatusLogs');
    if (statusLog) statusLog.textContent = "⏳ جاري مزامنة كادرات التكتلات والمجموعات لموسم 1448 من السحابة...";
    
    try {
        // 1️⃣ أولاً: جلب كادر الصفحة الأولى من جدول التكتلات
        const { data: clusterData, error: clusterError } = await supabaseClient
            .from('hajj_clusters_level')
            .select('*');
        
        if (clusterError) throw clusterError;
        globalStaffDatabase = clusterData || [];
        globalStaffData = clusterData || [];
        globalStaff = clusterData || [];

        // 2️⃣ ثانياً: جلب كادر المجموعات (الصفحة الثانية) من جدول المجموعات المخصص سحابياً
        const { data: groupsData, error: groupsError } = await supabaseClient
            .from('hajj_groups_level')
            .select('*');
            
        if (groupsError) throw groupsError;
        globalGroupsDatabase = groupsData || [];
        
        // 🟢 إضاءة الشاشة باللون الأخضر فور اكتمال المزامنة الثنائية للجدولين
        if (statusLog) statusLog.textContent = "🟢 تم مزامنة كادرات المنظومة وجدول المجموعات بنجاح";
        console.log("🕋 تم مزامنة الجدولين بنجاح من السحابة دفعة واحدة.");
        
    } catch (error) {
        console.error("خطأ المزامنة الحقيقي المشترك:", error);
        if (statusLog) statusLog.textContent = "🔴 فشل المزامنة: يرجى التحقق من مفاتيح supadate";
        globalStaffDatabase = [];
        globalGroupsDatabase = [];
    }
    
    // 🔄 تشغيل القوائم المنسدلة فوراً بعد شحن البيانات الحقيقية للذاكرة
    if (typeof populateLeaderDropdown === "function") populateLeaderDropdown();
    if (typeof populateGroupStaffDropdown === "function") populateGroupStaffDropdown();
}

// ==========================================
// 1. تحديث دالة ضخ أسماء رؤساء التكتلات بالسحابة
// ==========================================
function populateLeaderDropdown() {
  // التعديل: استهداف خزان البحث الذكي datalist بدلاً من select القديم
  const clusterLeadersList = document.getElementById('cluster_leaders_global_list');
  if (!clusterLeadersList) return;
  
  // تنظيف الخيارات القديمة
  clusterLeadersList.innerHTML = ''; 
  
  // تصفية البيانات لعرض من صفتهم "رئيس تكتل" فقط
  const leaders = globalStaffDatabase.filter(staff => staff.cluster_role === "رئيس تكتل");
  
  if (leaders.length === 0) {
    // في حال لم تكن الصفات مدخلة بعد، يتم عرض كافة الأسماء مجردة كخيار احتياطي
    globalStaffDatabase.forEach(staff => {
      const option = document.createElement('option');
      option.value = staff.full_name;
      clusterLeadersList.appendChild(option);
    });
    return;
  }
  
  // تعبئة القائمة الذكية برؤساء التكتلات المعتمدين
  leaders.forEach(leader => {
    const option = document.createElement('option');
    option.value = leader.full_name;
    clusterLeadersList.appendChild(option);
  });
}







// 1️⃣ إصلاح دالة تعبئة هاتف ومكتب رئيس التكتل فوراً عند الاختيار
function syncClusterLeaderData() {
    const selectedName = document.getElementById('c_leader_select').value;
    
    // تأمين جلب الخانات بكل الاحتمالات الممكنة للمعرّفات لضمان التعبئة الفورية
    const pInput = document.getElementById('c_leader_phone') || document.getElementById('phone_number') || document.getElementById('c_phone_input');
    const oInput = document.getElementById('c_registration_office') || document.getElementById('registration_office') || document.getElementById('c_office_input');
    
    const leaderObj = globalStaffDatabase.find(p => p.full_name === selectedName);
    
    if (leaderObj) {
        if (pInput) pInput.value = leaderObj.phone_number || '-';
        if (oInput) oInput.value = leaderObj.registration_office || 'عام';
        console.log("🟢 تم تعبئة هاتف ومكتب رئيس التكتل بنجاح:", leaderObj.full_name);
    } else {
        if (pInput) pInput.value = "";
        if (oInput) oInput.value = "";
    }
}

// 2️⃣ إصلاح دالة جلب خيارات كادر التكتل (المعاون والموجه والمنسق) بناءً على حقل cluster_role
function getOptionsByRole(roleName) {
    // التحويل البرمجي لمطابقة مسميات حقل cluster_role الحقيقي في جدول hajj_level وصورتك
    let targetRole = roleName;
    if (roleName === 'معاون') targetRole = 'معاون';
    if (roleName === 'منسق تقني') targetRole = 'منسق تقني';
    if (roleName === 'موجهة دينية') targetRole = 'موجهة دينية';
    
    const filtered = globalStaffDatabase.filter(p => p.cluster_role === targetRole);
    
    if (filtered.length === 0) {
        console.warn(`⚠️ لم يتم العثور على أسماء تطابق الصفة: ${targetRole} في السحابة.`);
        return '<option value="">-- لا توجد أسماء مطابقة في السحابة --</option>';
    }

    return filtered.map(p => `<option value="${p.full_name}">${p.full_name}</option>`).join('');
}

// 3️⃣ تفعيل وتحديث دالة بناء جدول كادر التكتل الرئيسي في الواجهة
function renderClusterStaffTable() {
 const tbody = document.getElementById('clusterTableBody');
 if (!tbody) return;
 const config = [
 { id: 'c_assistants_num', roleName: 'معاون' },
 { id: 'c_coord_num', roleName: 'منسق تقني' },
 { id: 'c_guides_num', roleName: 'موجهة دينية' }
 ];
 
 // 1. جمع الأسماء الحالية المكتوبة في الجدول قبل التعديل لتفادي ضياعها
 const currentSelections = {};
 config.forEach(item => {
   currentSelections[item.roleName] = [];
 });
 
 const existingRows = tbody.querySelectorAll('tr');
 existingRows.forEach(row => {
   const roleName = row.cells[1].textContent.trim();
   const inputEl = row.querySelector('.staff-select-input');
   if (inputEl && currentSelections[roleName]) {
     currentSelections[roleName].push(inputEl.value); 
   }
 });
 
 // 2. تفريغ الجدول بأمان لمنع التراكم والتعليق ✅
 tbody.innerHTML = "";
 let globalIndex = 1;
 
 // 3. إعادة بناء الجدول وضخ السطور بناءً على الأرقام
 config.forEach(item => {
   const inputEl = document.getElementById(item.id);
   const targetCount = inputEl ? (parseInt(inputEl.value) || 0) : 0;
   
   for (let i = 0; i < targetCount; i++) {
     const row = document.createElement('tr');
     const uniqueId = Math.floor(Math.random() * 999999);
     
     const savedValue = (currentSelections[item.roleName] && currentSelections[item.roleName][i]) ? currentSelections[item.roleName][i] : "";
     
     row.innerHTML = `
     <td style="padding:5px; border:1px solid #ddd; text-align:center;">${globalIndex++}</td>
     <td style="padding:5px; border:1px solid #ddd;"><strong>${item.roleName}</strong></td>
     <td style="padding:5px; border:1px solid #ddd;">
       <input type="text" class="staff-select-input" list="cluster_staff_list_${uniqueId}" 
       value="${savedValue}" 
       placeholder="اكتب اسم للبحث..." 
       onchange="syncStaffRowMeta(this); checkClusterRulesRealTime(); saveCurrentStateToLocalStorage();" 
       style="width:100%; padding:4px;">
       
       <datalist id="cluster_staff_list_${uniqueId}">
         ${getOptionsByRole(item.roleName)}
       </datalist>
     </td>
     <td style="padding:5px; border:1px solid #ddd; text-align:center;">
       <input type="text" class="row-approved-role" readonly placeholder="تلقائي" value="${item.roleName}" style="width:100%; padding:4px; background:#f0f4f8; border:none; text-align:center;">
     </td>
     `;
     tbody.appendChild(row);
   }
 });
}





// 4️⃣ إصلاح دالة إضافة المجموعات الديناميكية (الصفحة الثانية) لتظهر أسماء رؤساء المجموعات الحقيقية


// 🌟 أولاً: تعريف العداد البرمجي لتجنب تعليق الزر والمنصة
if (typeof groupCounter === 'undefined') {
    var groupCounter = 1; 
}

// 2️⃣ ثانياً: الدالة المصلحة بالكامل لإنشاء وإضافة المجموعات ديناميكياً

function addNewDynamicGroupSection() {
        const wrapper = document.getElementById('dynamicGroupsWrapper');
        if (!wrapper) {
        console.error("خطأ: لم يتم العثور على الحاوية dynamicGroupsWrapper الخاص بك.");
        return;
        }
        
        const gId = groupCounter++;
        const div = document.createElement('div');
        div.className = 'group-card-container';
        div.id = `group_block_${gId}`;
        
        // جلب الخيارات مباشرة من جدول المجموعات الجديد المخصص
        const groupLeadersOptions = globalGroupsDatabase
        .filter(p => p.group_role === "رئيس مجموعة" || p.cluster_role === "رئيس مجموعة") // التعديل هنا لفلترة الرؤساء فقط
        .map(p => `<option value="${p.full_name}"></option>`)
        .join('');

        div.innerHTML = `
        <div class="section-title" style="background: #e2e8f0; display:flex; justify-content:space-between; align-items:center; padding:8px 12px; font-weight:bold;">
        <!-- تعديل: إضافة معرف فريد للعنوان وتغيير التنسيق البدئي ليكون فاتحاً وغير عريض -->
        <span id="group_title_text_${gId}" class="group-title-label" style="color: #718096; font-weight: normal;">اسم المجموعة الجديدة...</span>
        <button class="btn btn-danger btn-remove-group" style="padding:2px 10px; font-size:11px;" onclick="removeGroupSection(${gId})">حذف المجموعة</button>
        </div>
        <div class="form-grid" style="margin-top:15px; display:grid; grid-template-columns: repeat(3, 1fr); gap:10px; padding:10px;">
        <div class="form-grid-cell">
            <label>اسم المجموعة</label>
            <!-- تعديل: استدعاء الدالة البرمجية الجديدة عند الكتابة لتحديث العنوان ولونه فوراً -->
            <input type="text" class="g-name" placeholder="اكتب اسم المجموعة" 
            oninput="updateGroupCardHeaderWithStyle(${gId}, this.value); saveCurrentStateToLocalStorage();" style="width:100%; padding:5px;">
        </div>
        <div class="form-grid-cell">
        <label>اسم رئيس المجموعة (ابحث هنا)</label>
        <input type="text" class="g-leader-select" list="leaders_list_${gId}" placeholder="اكتب اسم رئيس المجموعة للبحث..." oninput="syncGroupLeaderData(${gId}); saveCurrentStateToLocalStorage();" style="width:100%; padding:5px;">
        
        <!-- القائمة الذكية المصفاة الآن لحساب الرؤساء فقط -->
        <datalist id="leaders_list_${gId}">
            ${groupLeadersOptions}
        </datalist>
        </div>


        <div class="form-grid-cell">
            <label>رقم هاتف رئيس المجموعة</label>
            <input type="text" class="g-leader-phone" readonly placeholder="تلقائي" style="width:100%; padding:5px; background:#e2e8f0;">
        </div>
        <div class="form-grid-cell">
            <label>مكتب التسجيل</label>
            <input type="text" class="g-leader-office" readonly placeholder="تلقائي" style="width:100%; padding:5px; background:#e2e8f0;">
        </div>
        <div class="form-grid-cell">
            <label>عدد فئات المجموعة</label>
            <input type="text" class="g-categories" readonly placeholder="تلقائي" style="width:100%; padding:5px; background:#e2e8f0;">
        </div>
        <div class="form-grid-cell bg-empty"></div>
        <div class="form-grid-cell">
            <label>عدد المعاونين</label>
            <input type="number" class="g-assistants-count" value="0" min="0" oninput="renderGroupStaffTable(${gId}); saveCurrentStateToLocalStorage();" style="width:100%; padding:5px;">
        </div>
        <div class="form-grid-cell">
            <label>عدد الموجهين</label>
            <input type="number" class="g-clergy-count" value="0" min="0" oninput="renderGroupStaffTable(${gId}); saveCurrentStateToLocalStorage();" style="width:100%; padding:5px;">
        </div>
        </div>
        <div style="font-weight:bold; font-size:12px; margin: 10px 0 5px 0; padding:0 10px;">📋 الكادر الإداري في المجموعة</div>
        <table style="width:100%; border-collapse:collapse; margin-top:5px;">
        <thead>
            <tr style="background:#f4f6f9;">
            <th style="width:10%; padding:5px; border:1px solid #ddd;">الرقم</th>
            <th style="width:30%; padding:5px; border:1px solid #ddd;">الصفة في المجموعة</th>
            <th style="width:40%; padding:5px; border:1px solid #ddd;">الاسم المعتمد</th>
            <th style="width:20%; padding:5px; border:1px solid #ddd;">الصفة المعتمدة</th>
            </tr>
        </thead>
        <tbody class="group-staff-tbody"></tbody>
        </table>
        `;
        wrapper.appendChild(div);
        if (typeof updateGlobalMetrics === 'function') updateGlobalMetrics();
        if (typeof saveCurrentStateToLocalStorage === 'function') saveCurrentStateToLocalStorage();
}








// 5️⃣ إصلاح دالة تعبئة كادر المجموعة الفرعي (المعاونين والموجهين) بناءً على صورتك الحقيقية
function renderGroupStaffTable(gId) {
 const block = document.getElementById(`group_block_${gId}`);
 if (!block) return;
 const tbody = block.querySelector('.group-staff-tbody');
 if (!tbody) return;
 
 const aCount = parseInt(block.querySelector('.g-assistants-count').value) || 0;
 const cCount = parseInt(block.querySelector('.g-clergy-count').value) || 0;

 // 1. حفظ الأسماء المكتوبة حالياً في الجدول قبل تصفيره لتفادي ضياعها
 const currentSelections = {
   "معاون": [],
   "موجه ديني": [] 
 };

 const existingRows = tbody.querySelectorAll('tr');
 existingRows.forEach(row => {
   // قراءة الصفة من الخلية الثانية للسطر
   const roleCell = row.cells[1];
   const roleName = roleCell ? roleCell.textContent.trim() : "";
   const inputEl = row.querySelector('.g-row-staff-select');
   
   if (inputEl && currentSelections[roleName]) {
     currentSelections[roleName].push(inputEl.value); // حفظ الاسم مؤقتاً
   }
 });

 // 2. تفريغ الجدول بأمان لإعادة الترتيب التلقائي الصحيح لأسطر الكادر
 tbody.innerHTML = "";
 let idx = 1;
 
 // 3. إعادة بناء أسطر المعاونين وضخ أسمائهم السابقة
 for (let i = 0; i < aCount; i++) {
   const savedValue = currentSelections["معاون"][i] || "";
   appendGroupStaffRowWithVal(tbody, idx++, "معاون", gId, savedValue);
 }
 
 // 4. إعادة بناء أسطر الموجّهين وضخ أسمائهم السابقة
 for (let i = 0; i < cCount; i++) {
   const savedValue = currentSelections["موجه ديني"][i] || "";
   appendGroupStaffRowWithVal(tbody, idx++, "موجه ديني", gId, savedValue);
 }
}
function appendGroupStaffRowWithVal(tbody, index, roleName, gId, savedValue) {
 const row = document.createElement('tr');
 const randomId = Math.floor(Math.random() * 100000); // توليد معرف فريد لكل قائمة ذكية
 
 // تصفية كادر المجموعات من قاعدة البيانات السحابية بناءً على الصفة
 const options = globalGroupsDatabase
   .filter(p => p.cluster_role === roleName || p.group_role === roleName)
   .map(p => `<option value="${p.full_name}"></option>`)
   .join('');

 row.innerHTML = `
 <td style="padding:5px; border:1px solid #ddd; text-align:center;">${index}</td>
 <td style="padding:5px; border:1px solid #ddd;"><strong>${roleName}</strong></td>
 <td style="padding:5px; border:1px solid #ddd;">
   <!-- حقن القيمة المستعادة في خاصية value للمدخل الذكي -->
   <input type="text" class="g-row-staff-select" list="staff_list_${randomId}" 
     value="${savedValue}" 
     placeholder="اكتب اسم الـ ${roleName} للبحث..."
     oninput="syncStaffRowMeta(this); saveCurrentStateToLocalStorage();" style="width:100%; padding:4px;">
   
   <datalist id="staff_list_${randomId}">
     ${options}
   </datalist>
 </td>
 <td style="padding:5px; border:1px solid #ddd; text-align:center;">
   <input type="text" class="row-approved-role" readonly placeholder="تلقائي" value="${roleName}" style="width:100%; padding:4px; background:#f4f6f9; border:none; text-align:center;">
 </td>
 `;
 tbody.appendChild(row);
}





// 6️⃣ دالة إدراج السطور الفرعية لكادر المجموعة مصلحة بالكامل ومطابقة للسحابة

function appendGroupStaffRow(tbody, index, roleName, gId) {
 const row = document.createElement('tr');
 const randomId = Math.floor(Math.random() * 100000); // معرف فريد لكل قائمة كادر
 
 // تصفية كادر المجموعات من جدول المجموعات الجديد بناءً على الصفة
 const options = globalGroupsDatabase
   .filter(p => p.cluster_role === roleName || p.group_role === roleName)
   .map(p => `<option value="${p.full_name}"></option>`)
   .join('');

 row.innerHTML = `
 <td style="padding:5px; border:1px solid #ddd; text-align:center;">${index}</td>
 <td style="padding:5px; border:1px solid #ddd;"><strong>${roleName}</strong></td>
 <td style="padding:5px; border:1px solid #ddd;">
   <!-- حقل البحث الذكي للكادر -->
   <input type="text" class="g-row-staff-select" list="staff_list_${randomId}" placeholder="اكتب اسم الـ${roleName} للبحث..."
     oninput="syncStaffRowMeta(this); saveCurrentStateToLocalStorage();" style="width:100%; padding:4px;">
   
   <datalist id="staff_list_${randomId}">
     ${options}
   </datalist>
 </td>
 <td style="padding:5px; border:1px solid #ddd; text-align:center;">
   <input type="text" class="row-approved-role" readonly placeholder="تلقائي" value="${roleName}" style="width:100%; padding:4px; background:#f4f6f9; border:none; text-align:center;">
 </td>
 `;
 tbody.appendChild(row);
}





// 7️⃣ تعبئة بيانات السطر تلقائياً عند اختيار كادر المجموعة
function syncStaffRowMeta(selectElement) {
  const row = selectElement.closest('tr');
  if (!row) return;

  const roleInput = row.querySelector('.row-approved-role');
  const selectedName = selectElement.value.trim();

  if (!selectedName) {
    if (roleInput) roleInput.value = "";
    return;
  }

  // 1. أولاً: التحقق مما إذا كان السطر ينتمي لجدول كادر المجموعات الفرعية
  const isGroupTable = selectElement.classList.contains('g-row-staff-select');

  if (isGroupTable) {
    // البحث حصرياً داخل جدول المجموعات الجديد لضمان جلب الصفة الصحيحة للمجموعة
    const person = globalGroupsDatabase.find(p => p.full_name === selectedName);
    if (person && roleInput) {
      // حقن الصفة المعتمدة الحقيقية من السحاب (مثل: معاون أو موجه ديني)
      roleInput.value = person.group_role || person.cluster_role || roleInput.value;
    }
  } else {
    // 2. ثانياً: إذا كان السطر ينتمي لجدول كادر التكتل الرئيسي العلوي
    const person = globalStaffDatabase.find(p => p.full_name === selectedName);
    if (person && roleInput) {
      roleInput.value = person.cluster_role || roleInput.value;
    }
  }

  // تحديث شريط التنبيهات الملون بعد تعديل الكوادر والصفات المعتمدة
  if (typeof checkClusterRulesRealTime === 'function') {
    checkClusterRulesRealTime();
  }
}








function removeGroupSection(gId) {
    document.getElementById(`group_block_${gId}`).remove();
    updateGlobalMetrics();
    saveCurrentStateToLocalStorage();
}
// دالة تعديل عدد الفئات تجربة 
function updateGlobalMetrics() {
  const wrapper = document.getElementById('dynamicGroupsWrapper');
  if (!wrapper) return;

  const groupBlocks = wrapper.children;
  const totalGroups = groupBlocks.length;
  
  // 1. تحديث حقل عدد المجموعات المنضوية تلقائيًا بأعلى الواجهة
  const groupsNumInput = document.getElementById('c_groups_num');
  if (groupsNumInput) {
    groupsNumInput.value = totalGroups;
  }

  // 2. الحسبة الرياضية الذكية لجمع قيم الفئات التراكمية (1 + 2 + 3 + 4...)
  let totalCategoriesSum = 0;

  for (let block of groupBlocks) {
    const categoryInput = block.querySelector('.g-categories');
    if (categoryInput && categoryInput.value) {
      // تحويل الأرقام الهندية/الشرقية (١، ٢، ٣) إلى أرقام برمجية قياسية وتطهير النص تمامًا
      let rawValue = categoryInput.value.toString().replace(/[٠-٩]/g, function(d) {
        return d.charCodeAt(0) - 1632;
      }).replace(/[^0-9]/g, '');

      // تحويل النص النظيف إلى رقم حقيقي واحتسابه بالتجميع
      let categoryValue = parseInt(rawValue) || 0;
      totalCategoriesSum += categoryValue;
    }
  }

  // 3. تحديث الحقل الرئيسي في أعلى الواجهة بالمجموع الإجمالي الصحيح للفئات
  const categoriesNumInput = document.getElementById('c_categories_num');
  if (categoriesNumInput) {
    categoriesNumInput.value = totalCategoriesSum > 0 ? `${totalCategoriesSum} فئات نشطة` : "٠ فئات";
  }

  // 4. إطلاق تحديث فوري لشريط التنبيهات الوزاري الملون ليحسب النصاب التنظيمي الجديد
  if (typeof checkClusterRulesRealTime === 'function') {
    checkClusterRulesRealTime();
  }
}


function saveCurrentStateToLocalStorage() {
  const state = {
    c_name: document.getElementById('c_name').value,
    c_leader: document.getElementById('c_leader_select').value,
    c_assistants: document.getElementById('c_assistants_num').value,
    c_coord: document.getElementById('c_coord_num').value,
    c_guides: document.getElementById('c_guides_num').value,
    
    // 1. حفظ أسماء الأشخاص المختارين لكادر التكتل الرئيسي
    clusterStaffNames: Array.from(document.querySelectorAll('#clusterTableBody .staff-select-input')).map(select => select.value),
    
    groups: []
  };

  // 2. حفظ المجموعات وكادرها الداخلي بالأسماء المحددة
  const groupsBlocks = document.getElementById('dynamicGroupsWrapper').children;
  for (let block of groupsBlocks) {
    // جمع أسماء الكادر المختار داخل هذه المجموعة المحددة (معاونين وموجهين)
    const staffSelects = block.querySelectorAll('.g-row-staff-select');
    const groupStaffNames = Array.from(staffSelects).map(select => select.value);

    state.groups.push({
      name: block.querySelector('.g-name').value,
      leader: block.querySelector('.g-leader-select').value,
      assistants: block.querySelector('.g-assistants-count').value,
      clergy: block.querySelector('.g-clergy-count').value,
      staffNames: groupStaffNames // تخزين الأسماء المحددة داخلياً
    });
  }

  localStorage.setItem('hajj_platform_state', JSON.stringify(state));
}




// حفظ المعلومات 
function loadStateFromLocalStorage() {
  const saved = localStorage.getItem('hajj_platform_state');
  if (!saved) return;
  
  try {
    const state = JSON.parse(saved);
    
    // استعادة بيانات التكتل الأساسية
    document.getElementById('c_name').value = state.c_name || "";
    document.getElementById('c_leader_select').value = state.c_leader || "";
    syncClusterLeaderData();
    
    document.getElementById('c_assistants_num').value = state.c_assistants || 0;
    document.getElementById('c_coord_num').value = state.c_coord || 0;
    document.getElementById('c_guides_num').value = state.c_guides || 0;
    
    // بناء جدول كادر التكتل الرئيسي
    renderClusterStaffTable();
    
    // تعيين الأسماء المخزنة لكادر التكتل الرئيسي
    if (state.clusterStaffNames && state.clusterStaffNames.length > 0) {
      const clusterSelects = document.querySelectorAll('#clusterTableBody .staff-select-input');
      clusterSelects.forEach((select, idx) => {
        if (state.clusterStaffNames[idx]) {
          select.value = state.clusterStaffNames[idx];
          syncStaffRowMeta(select); // تحديث الصفة التلقائية المعتمدة
        }
      });
    }
    
    // استعادة بناء المجموعات وكادراتها الفرعية
    if (state.groups) {
      state.groups.forEach(g => {
        addNewDynamicGroupSection();
        const lastBlock = document.getElementById('dynamicGroupsWrapper').lastChild;
        const gId = lastBlock.id.replace('group_block_', '');
        
        // تعيين نصوص وعناوين المجموعة الملونة المحدثة
        lastBlock.querySelector('.g-name').value = g.name;
        updateGroupCardHeaderWithStyle(gId, g.name);
        
        lastBlock.querySelector('.g-leader-select').value = g.leader;
        lastBlock.querySelector('.g-assistants-count').value = g.assistants;
        lastBlock.querySelector('.g-clergy-count').value = g.clergy;
        
        syncGroupLeaderData(gId);
        renderGroupStaffTable(gId); // بناء جدول كادر المجموعة الداخلي
        
        // تعيين أسماء المعاونين والموجهين داخل هذه المجموعة من الذاكرة المحلية
        if (g.staffNames && g.staffNames.length > 0) {
          const groupSelects = lastBlock.querySelectorAll('.g-row-staff-select');
          groupSelects.forEach((select, idx) => {
            if (g.staffNames[idx]) {
              select.value = g.staffNames[idx];
              syncStaffRowMeta(select); // تحديث الحقول المعتمدة التلقائية لسطر الكادر
            }
          });
        }
      });
    }
  } catch(e) { 
    console.error("خطأ حرج أثناء استعادة كادرات التكتلات والمجموعات المخزنة محلياً:", e); 
  }
}



async function commitAndLockCluster() {
    const cName = document.getElementById('c_name').value || "تكتل غير مسمى";
    const btn = document.getElementById('btnLockCluster');
    btn.textContent = "⏳ جاري إرسال التشكيل المعتمد لـ supadate...";
    const payload = [{
        cluster_name: cName,
        leader_name: document.getElementById('c_leader_select').value,
        total_groups: document.getElementById('c_groups_num').value,
        timestamp_approved: new Date().toISOString()
    }];
    await supabaseClient.from('approved_clusters').insert(payload);
    btn.className = "btn btn-success";
    btn.style.backgroundColor = "#00875a";
    btn.style.borderColor = "#00875a";
    btn.textContent = "🟢 تم اعتماد التشكيل";
    document.querySelectorAll('input, select, button').forEach(el => {
        if(el.id !== 'btnLockCluster') { el.disabled = true; }
    });
    document.getElementById('btnAddGroup').style.display = 'none';
    document.querySelectorAll('.btn-remove-group').forEach(b => b.style.display = 'none');
    alert("🔐 تم قفل التشكيل بنجاح سحابياً على منصة supadate وجمدت الواجهة الثانية عن التعديل.");
}

function generateOfficialPdfDecision() {
    const wrapper = document.getElementById('dynamicGroupsWrapper').children;
    for(let block of wrapper) { block.classList.add('page-break'); }
    window.print();
}

async function loadApprovedClustersListForAdmin() {
    const selector = document.getElementById('adminClusterSelector');
    const sampleApproved = ["التكتل الرئيسي رقم 1", "تكتل المحافظات الشمالية", "تكتل الفئة المتميزة"];
    selector.innerHTML = '<option value="">-- اختر اسم التكتل المستدعى --</option>';
    sampleApproved.forEach(c => {
        selector.innerHTML += `<option value="${c}">${c}</option>`;
    });
}

function loadApprovedClusterDetailsFromSupabase() {
    const selected = document.getElementById('adminClusterSelector').value;
    const display = document.getElementById('adminDataDisplayArea');
    if(!selected) { display.style.display = 'none'; return; }
    display.style.display = 'block';
    display.innerHTML = `
        <div class="section-title">📝 استعراض بيانات supadate الحية للتكتل: ${selected}</div>
        <div style="padding:20px; border:1px solid #000; background:#fff;">
            <p><strong>حالة التشكيل الإداري:</strong> معتمد ومقفل بالكامل من رئيس التكتل</p>
            <p><strong>تاريخ وتوقيت المزامنة الميدانية السحابية:</strong> ${new Date().toLocaleString('ar-SY')}</p>
            <div style="color:var(--success); font-weight:bold;">🟢 كافة جداول الأسماء والكادرات الإدارية التابعة محفوظة ومحمية سحابياً بنجاح في قاعدة البيانات.</div>
        </div>
    `;
}
function updateGroupCardHeaderWithStyle(gId, value) {
  const titleSpan = document.getElementById(`group_title_text_${gId}`);
  if (!titleSpan) return;

  if (value.trim() !== "") {
    // عند الكتابة: يظهر النص "اسم المجموعة: [ما يكتبه المستخدم]" بلون داكن وخط عريض
    titleSpan.textContent = `اسم المجموعة: ${value}`;
    titleSpan.style.color = "#1a202c"; // لون أسود داكن
    titleSpan.style.fontWeight = "bold"; // خط عريض
  } else {
    // إذا أفرغ المستخدم الحقل: يعود النص إلى "اسم المجموعة" الافتراضي بخط فاتح وعادي
    titleSpan.textContent = "اسم المجموعة";
    titleSpan.style.color = "#718096"; // لون رمادي فاتح
    titleSpan.style.fontWeight = "normal"; // خط عادي
  }
}

function syncGroupLeaderData(gId) {
 const block = document.getElementById(`group_block_${gId}`);
 if (!block) return;
 
 // جلب حقول الإدخال الفرعية بداخل بطاقة المجموعة الحالية
 const selectedName = block.querySelector('.g-leader-select').value.trim();
 const pInput = block.querySelector('.g-leader-phone');
 const oInput = block.querySelector('.g-leader-office');
 const cInput = block.querySelector('.g-categories');
 
 if (!selectedName) {
   if (pInput) pInput.value = "";
   if (oInput) oInput.value = "";
   if (cInput) cInput.value = "";
   // تحديث فوري فوري للعداد العلوي بالخصم عند مسح الاسم
   if (typeof updateGlobalMetrics === 'function') updateGlobalMetrics();
   return;
 }
 
 // البحث داخل المصفوفة السحابية المجلوبة من Supabase
 const leaderObj = globalGroupsDatabase.find(p => p.full_name === selectedName);
 
 if (leaderObj) {
   // تعبئة البيانات التلقائية الفورية بالبطاقة الميدانية
   if (pInput) pInput.value = leaderObj.phone_number || '-';
   if (oInput) oInput.value = leaderObj.registration_office || 'عام';
   
   // ⚡ ضخ القيمة الصافية القادمة من عمود category (مثل الرقم 2 مباشرة)
   if (cInput) cInput.value = leaderObj.category || '1'; 
   
   console.log(`🍏 نجاح: تم العثور على الكادر وضخ الفئة (${cInput.value}) للمجموعة بنجاح.`);
 } else {
   // في حال كان المستخدم مستمراً في الكتابة ولم يتطابق الاسم بالكامل بعد
   if (pInput) pInput.value = "جاري الفرز...";
   if (oInput) oInput.value = "-";
   if (cInput) cInput.value = "-";
 }
 
 // ⚡ الترتيب الصارم: تشغيل العداد الرياضي للجمع أولاً ليقبع الرقم 2 في الحقل الرئيسي بالأعلى
 if (typeof updateGlobalMetrics === 'function') {
   updateGlobalMetrics();
 }
 
 // ثانياً: تحديث شريط التنبيهات الوزاري الملون بناءً على الحصيلة الرقمية الجديدة
 if (typeof checkClusterRulesRealTime === 'function') {
   checkClusterRulesRealTime();
 }
}



// ==========================================================================
// 📥 أ: دالة جلب ضوابط الشروط من جدول Supabase ديناميكياً
// ==========================================================================
///11111
async function fetchValidationRulesFromCloud() {
  try {
    console.log("📡 جاري محاولة سحب الشروط من Supabase...");
    
    // التعديل هنا: استخدام المتغير الموحد supabaseClient بدلاً من التسميات المكررة
    const { data, error } = await supabaseClient
      .from('hajj_validation_rules')
      .select('rule_key, rule_value');

    if (error) throw error;

    if (data && data.length > 0) {
      // تفريغ البيانات القديمة لإعادة الضخ الجديد المحدث حياً
      CloudClusterValidationConfig = {}; 
      
      data.forEach(item => {
        CloudClusterValidationConfig[item.rule_key] = item.rule_value;
      });
      
      console.log("🍏 نجاح تام: تم سحب الضوابط الحية من السحاب والمزامنة متطابقة:", CloudClusterValidationConfig);
      
      // تشغيل فحص فوري ملون فور نجاح سحب الشروط من السيرفر
      if (typeof checkClusterRulesRealTime === 'function') {
        checkClusterRulesRealTime();
      }
    } else {
      console.warn("⚠️ الجدول السحابي فارغ أو الـ RLS تحظر القراءة، تم تشغيل القيم الاحتياطية.");
      useFallbackRules();
    }
  } catch (err) {
    console.error("❌ فشل الاتصال بقاعدة البيانات السحابية، تم الانتقال للقيم المحلية الآمنة:", err);
    useFallbackRules();
  }
}

// دالة فرعية لحماية الواجهة من التوقف في حال انقطاع الإنترنت أو السيرفر
function useFallbackRules() {
  CloudClusterValidationConfig = {
    min_cluster_categories: 15,
    max_cluster_categories: 21,
    required_assistants: 1,
    categories_per_coordinator: 6,
    categories_per_guide: 7
  };
  if (typeof checkClusterRulesRealTime === 'function') checkClusterRulesRealTime();
}


// ==========================================================================
// 📊 ب: دالة الفحص الديناميكية المحدثة لتقرأ من المتغيرات السحابية
// ==========================================================================

function checkClusterRulesRealTime() {
    const alertBar = document.getElementById('ministerial-validation-bar');
    if (!alertBar) return;

    const assistantsCount = parseInt(document.getElementById('c_assistants_num').value) || 0;
    const coordinatorsCount = parseInt(document.getElementById('c_coord_num').value) || 0;
    const guidesCount = parseInt(document.getElementById('c_guides_num').value) || 0;
    const groupBlocks = document.getElementById('dynamicGroupsWrapper').children;
    
    let totalClusterCategories = 0;
    for (let block of groupBlocks) {
        const gCategories = parseInt(block.querySelector('.g-categories').value) || 0;
        totalClusterCategories += gCategories;
    }

    let redErrors = [];    // للمخالفات الحرجة (اللون الأحمر)
    let yellowWarnings = []; // للتنبيهات الإرشادية والزيادات (اللون الأصفر)

    // 1. فحص نطاق الفئات الكلية للتشكيل
    const minCat = CloudClusterValidationConfig.min_cluster_categories || 15;
    const maxCat = CloudClusterValidationConfig.max_cluster_categories || 21;
    if (totalClusterCategories < minCat || totalClusterCategories > maxCat) {
        redErrors.push(`القرار يوجب أن يكون مجموع الفئات بين ${minCat} و ${maxCat} فئة (الحالي: ${totalClusterCategories} فئة).`);
    }

    // 2. فحص المعاونين
    const reqAssistants = CloudClusterValidationConfig.required_assistants || 1;
    if (assistantsCount < reqAssistants) {
        redErrors.push(`يوجد نقص في عدد المعاونين (المطلب الوزاري: ${reqAssistants} معاون فقط).`);
    } else if (assistantsCount > reqAssistants) {
        yellowWarnings.push(`ملاحظة: يوجد كادر معاون إضافي زائد عن الشروط المحددة.`);
    }

    // 3. حسبة المنسقين مع التقريب الإداري (0.5)
    const coordDivisor = CloudClusterValidationConfig.categories_per_coordinator || 6;
    const exactCoordinators = totalClusterCategories / coordDivisor; // الحسبة الحقيقية
    
    // تطبيق القاعدة: إذا كان الكسر 0.5 أو أكثر يقرب للأعلى، وإلا يقرب للأسفل
    const requiredCoordinators = Math.round(exactCoordinators); 

    if (coordinatorsCount < requiredCoordinators) {
        redErrors.push(`يوجد نقص حرج في عدد المنسقين (المطلوب بعد التقريب: ${requiredCoordinators} منسقين، الحالي: ${coordinatorsCount}).`);
    } else if (coordinatorsCount > requiredCoordinators) {
        // إذا زاد المستخدم عن المطلوب الفعلي بعد الحسبة والتقريب 🟡
        yellowWarnings.push(`ملاحظة تنبيهية: يوجد منسق تقني إضافي زائد عن شروط التقريب الإداري المعتمَد.`);
    }

    // 4. حسبة الموجهات مع التقريب الإداري (0.5)
    const guideDivisor = CloudClusterValidationConfig.categories_per_guide || 7;
    const exactGuides = totalClusterCategories / guideDivisor; // الحسبة الحقيقية
    
    // تطبيق القاعدة: إذا كان الكسر 0.5 أو أكثر يقرب للأعلى، وإلا يقرب للأسفل
    const requiredGuides = Math.round(exactGuides); 

    if (guidesCount < requiredGuides) {
        redErrors.push(`يوجد نقص حرج في عدد الموجهات (المطلوب بعد التقريب: ${requiredGuides} موجهات، الحالي: ${guidesCount}).`);
    } else if (guidesCount > requiredGuides) {
        // إذا زادت الموجهات عن المطلوب الفعلي بعد الحسبة والتقريب 🟡
        yellowWarnings.push(`ملاحظة تنبيهية: توجد موجهة دينية إضافية زائدة عن شروط التقريب الإداري المعتمَد.`);
    }

    // 5. التحكم في مظهر شريط التنبيهات بناءً على النتائج المحدثة
    if (redErrors.length > 0) {
        alertBar.style.backgroundColor = "#fef2f2";
        alertBar.style.borderColor = "#fca5a5";
        alertBar.style.color = "#991b1b";
        alertBar.innerHTML = `
            <div style="font-size: 15px; margin-bottom: 5px;"><strong>🚨 تنبيـه تنظيمي حرج: التشكيل يحتوي على مخالفات لشروط القرار الإداري رقم ٤٧</strong></div>
            <ul style="margin: 0; padding-right: 20px; font-weight: normal; font-size: 13px; line-height: 1.8;">
                ${redErrors.map(err => `<li>${err}</li>`).join('')}
            </ul>`;
    } else if (yellowWarnings.length > 0) {
        // تفعيل الإضاءة الصفراء فور وجود أي زيادة إدارية عن الحسبة المقربة 🟡
        alertBar.style.backgroundColor = "#fefcbf";
        alertBar.style.borderColor = "#f6e05e";
        alertBar.style.color = "#744210";
        alertBar.innerHTML = `
            <div style="font-size: 15px; margin-bottom: 5px;"><strong>⚠️ إشعار إداري: تم رصد كادر إداري إضافي زائد عن شروط التشكيل المقرّبة</strong></div>
            <ul style="margin: 0; padding-right: 20px; font-weight: normal; font-size: 13px; line-height: 1.8;">
                ${yellowWarnings.map(wrn => `<li>${wrn}</li>`).join('')}
            </ul>`;
    } else {
        alertBar.style.backgroundColor = "#ecfdf5";
        alertBar.style.borderColor = "#a7f3d0";
        alertBar.style.color = "#065f46";
        alertBar.innerHTML = `✨ <strong>كافة البيانات المدخلة متطابقة!</strong> تشكيل نظامي ممتاز ومتوافق تماماً مع ضوابط مديرية الحج والعمرة مع احتساب قاعدة التقريب.`;
    }
}
// الدالة الجديدة: سحب وفحص الصلاحيات وكلمات المرور مباشرة من السحاب بأمان
async function authenticateUserGateway() {
    const usernameInput = document.getElementById('accessUsername').value.trim();
    const passcodeInput = document.getElementById('accessPasscode').value;
    const loginButton = document.querySelector('.btn-primary');

    // التحقق من تعبئة الحقول أولاً قبل إرهاق السيرفر
    if (!usernameInput || !passcodeInput) {
        alert("يرجى إدخال اسم المستخدم وكلمة المرور معاً!");
        return;
    }

    // تغيير مظهر الزر لإعلام المستخدم بجاري الفحص السحابي
    const originalButtonText = loginButton.innerHTML;
    loginButton.innerHTML = "⏳ جاري التحقق من السحاب...";
    loginButton.disabled = true;

    try {
        // 1. الاتصال بالسحاب وجلب بيانات الحساب المطابق لاسم المستخدم
        // يفترض وجود جدول في Supabase يحتوي على الأعمدة (username, password, role)
        const { data: userAccount, error } = await supabaseClient
            .from('hajj_system_users') // اسم الجدول السحابي المخصص للمستخدمين
            .select('*')
            .eq('username', usernameInput)
            .maybeSingle(); // جلب سجل فردي واحد فقط مطابِق بأمان

        if (error) throw error;

        // 2. التحقق من وجود الحساب ومطابقة كلمة المرور القادمة حية من السحاب
        if (userAccount && userAccount.password === passcodeInput) {
            
            // إخفاء بوابة الحماية فوراً بعد النجاح
            document.getElementById('gatekeeperSystem').style.display = 'none';

            // 3. توجيه المستخدم ديناميكياً بناءً على صلاحيته (role) المخزنة في السحاب
            if (userAccount.role === "Admin" || userAccount.role === "مدير عام") {
                // توجيه لـ لوحة تحكم المدير العام
                document.getElementById('leaderPlatform').style.display = 'none';
                document.getElementById('adminPlatform').style.display = 'block';
                
                await loadApprovedClustersListForAdmin(); // جلب التشكيلات المرفوعة فوراً
            } 
            else if (userAccount.role === "Leader" || userAccount.role === "رئيس تكتل") {
                // توجيه لـ منصة التعبئة الميدانية لرئيس التكتل
                document.getElementById('adminPlatform').style.display = 'none';
                document.getElementById('leaderPlatform').style.display = 'block';
                
                // جلب الضوابط والشروط واستعادة حالة العمل
                await fetchValidationRulesFromCloud();
                await loadInitialStaffFromCloud();
                loadStateFromLocalStorage();
            } 
            else {
                alert("صلاحية هذا الحساب غير معرّفة بالمنظومة، يرجى مراجعة الدعم الفني.");
                // إعادة تصدير شاشة الدخول
                document.getElementById('gatekeeperSystem').style.display = 'block';
            }

        } else {
            // في حال عدم التطابق أو عدم وجود الحساب
            alert("اسم المستخدم أو كلمة المرور السحابية غير صحيحة!");
        }

    } catch (err) {
        console.error("خطأ حرج أثناء سحب الصلاحيات من السحاب:", err);
        alert("فشل الاتصال بالسحاب للتحقق من الهوية، يرجى التأكد من الإنترنت أو إعدادات الجدول!");
    } finally {
        // إعادة الزر لوضعه الطبيعي في كل الأحوال
        loginButton.innerHTML = originalButtonText;
        loginButton.disabled = false;
    }
}
