// 🌐 الرابط السحابي المباشر الخاص بملف غوغل شيت لفلترة الأسماء سحابياً حياً
const googleSheetCsvUrl = "⚠️ ضع_هنا_رابط_الـ_CSV_الذي_نسخته_من_خطوة_النشر ⚠️";

var staffDb = [];
var groupCounter = 0; // عداد المجموعات المضافة ديناميكياً لتوليد الواجهات الحية

// ⌨️ رصد ضغط زر Enter على لوحة المفاتيح للدخول الصامت والفوري
function handleEnterKey(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        authenticateUserGateway(); // تشغيل بوابة التحقق فوراً دون أي نوافذ تأكيد
    }
}

// 👁️ إظهار وإخفاء رمز الصلاحية (النجوم) داخل حقل الحماية
function togglePasswordVisibility() {
    var passwordInput = document.getElementById('accessPasscode');
    var eyeIcon = document.getElementById('eyeIcon');
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        eyeIcon.innerText = "❌";
    } else {
        passwordInput.type = "password";
        eyeIcon.innerText = "👁️";
    }
}

// 🔓 دالة التحقق الرقمي والدخول الصامت بدون رسائل تأكيد منبثقة
function authenticateUserGateway() {
    var inputCode = document.getElementById('accessPasscode').value.trim();
    var authGate = document.getElementById('gatekeeperSystem');
    var mainPlatform = document.getElementById('mainHajjPlatform');

    if (!inputCode) { 
        alert("⚠️ فضلاً، أدخل رمز الصلاحية أولاً!"); 
        return; 
    }

    // الانتقال مباشر وصامت تماماً وبدون لوحة تحكم فرعية
    if (inputCode === "main123456" || inputCode === "admn123") {
        authGate.style.display = 'none';
        mainPlatform.style.display = 'block';
        initializePlatformUI();
    } else {
        alert("❌ رمز الصلاحية المكتوب غير مسجل بنظام المديرية!");
    }
}

// ⚙️ تهيئة الواجهة وعرض تاريخ اليوم الحي عند الدخول السلس
function initializePlatformUI() {
    document.getElementById('liveDate').innerText = new Date().toISOString().split('T')[0];
    fetchStaffFromGoogleSheets();
}

// ⏳ دالة الاتصال بالسحابة وتفكيك ملف الغوغل شيت عبر مكتبة SheetJS الفورية
function fetchStaffFromGoogleSheets() {
    if(googleSheetCsvUrl.includes("⚠️")) {
        renderClusterStaffTable();
        addNewDynamicGroupSection(); // توليد المجموعة الأولى افتراضياً
        return;
    }
    
    fetch(googleSheetCsvUrl)
        .then(response => response.text())
        .then(csvText => {
            var workbook = XLSX.read(csvText, {type: 'string'});
            var worksheet = workbook.Sheets[workbook.SheetNames[0]];
            staffDb = XLSX.utils.sheet_to_json(worksheet);
            document.getElementById('adminStatusLogs').innerText = '✅ تم التحديث السحابي! جلب عدد (' + staffDb.length + ') اسم كادر معتمد حياً.';
            
            populateClusterLeaderDropdown();
            renderClusterStaffTable();
            addNewDynamicGroupSection(); // توليد المجموعة الأولى افتراضياً بعد نجاح الاتصال
        })
        .catch(error => {
            console.error("Error:", error);
            document.getElementById('adminStatusLogs').innerText = '❌ فشل الاتصال بالسحابة.';
            renderClusterStaffTable();
            addNewDynamicGroupSection();
        });
}

// 🗂️ تعبئة قائمة رئيس التكتل تلقائياً من السحابة بناءً على الصفة
function populateClusterLeaderDropdown() {
    var leaderSelect = document.getElementById('c_leader_select');
    leaderSelect.innerHTML = '<option value="">-- ابحث واختر رئيس التكتل --</option>';
    staffDb.forEach(function(person) {
        if(person.الصفة === "رئيس تكتل") {
            leaderSelect.innerHTML += '<option value="' + person.الاسم + '">' + person.الاسم + '</option>';
        }
    });
}

// 📊 المزامنة والربط التلقائي: جلب الهاتف ومكتب التسجيل تلقائياً فور اختيار رئيس التكتل
function syncClusterLeaderData() {
    var selectedLeader = document.getElementById('c_leader_select').value;
    var phoneInput = document.getElementById('c_leader_phone');
    var officeInput = document.getElementById('c_registration_office');
    
    var match = staffDb.find(s => s.الاسم === selectedLeader && s.الصفة === "رئيس تكتل");
    if(match) {
        phoneInput.value = match.الهاتف || 'غير مدرج';
        officeInput.value = match.المكتب || 'المكتب الرئيسي للمديرية'; // يعتمد على عمود المكتب بملفك
    } else {
        phoneInput.value = ''; officeInput.value = '';
    }
    renderClusterStaffTable();
}

// 🔄 تصفير حجز الأسماء للسماح بإعادة فرز الجداول بشكل نظيف ومنع تكرار الاسم الواحد
function resetStaffClaims() {
    staffDb.forEach(s => s.isTaken = false);
}

// 📊 توليد وبناء جدول كادر التكتل الرئيسي بناءً على مدخلات الأعداد المطلوبة (إضافة معاون، منسق، إلخ)
function renderClusterStaffTable() {
    var tbody = document.getElementById('clusterTableBody');
    if(!tbody) return; tbody.innerHTML = '';
    resetStaffClaims();

    var coords = parseInt(document.getElementById('c_coord_num').value) || 0;
    var guides = parseInt(document.getElementById('c_guides_num').value) || 0;
    var assistants = parseInt(document.getElementById('c_assistants_num').value) || 0;
    var clergy = parseInt(document.getElementById('c_clergy_num').value) || 0;

    var clusterRoles = [];
    for(var i=1; i<=coords; i++) clusterRoles.push("منسق");
    for(var j=1; j<=guides; j++) clusterRoles.push("موجهة دينية");
    for(var k=1; k<=assistants; k++) clusterRoles.push("معاون");
    for(var l=1; l<=clergy; l++) clusterRoles.push("موجه ديني");

    var index = 1;
    clusterRoles.forEach(function(role) {
        appendRowToTable(tbody, index++, role);
    });
}

// ➕ المحرك السحري لتوليد وإضافة الأقسام والمجموعات الميدانية المتعددة ديناميكياً مع حقول إدخال الكوادر
function addNewDynamicGroupSection() {
    groupCounter++;
    var wrapper = document.getElementById('dynamicGroupsWrapper');
    
    var groupHtml = `
        <div class="dynamic-group-box" id="groupWrapper_${groupCounter}" style="margin-top: 30px; border-top: 2px dashed var(--primary); padding-top: 15px;">
            <div class="section-title" style="background-color: #243e6b;">📦 التحديد الثالث: المجموعة المنضوية رقم (${groupCounter})</div>
            <div class="form-grid">
                <div class="form-grid-cell"><label>اسم المجموعة الداخلي</label><input type="text" id="g_name_${groupCounter}" value="مجموعة فرعية رقم ${groupCounter}"></div>
                <div class="form-grid-cell">
                    <label>رئيس المجموعة (الاسم)</label>
                    <select id="g_leader_select_${groupCounter}" onchange="syncDynamicGroupLeaderData(${groupCounter})">
                        <option value="">-- ابحث واختر رئيس المجموعة --</option>
                    </select>
                </div>
                <div class="form-grid-cell"><label>رقم هاتف رئيس المجموعة</label><input type="text" id="g_leader_phone_${groupCounter}" readonly placeholder="يُجلب تلقائياً"></div>
                <div class="form-grid-cell"><label>مكتب التسجيل (رئيس المجموعة)</label><input type="text" id="g_office_${groupCounter}" readonly placeholder="يُجلب تلقائياً"></div>
                <div class="form-grid-cell"><label>الفئة المعتمدة للمجموعة</label><input type="text" id="g_category_${groupCounter}" readonly placeholder="تُجلب تلقائياً"></div>
                
                <div class="form-grid-cell"><label>عدد المعاونين المطلوبين للمجموعة</label><input type="number" id="g_assistants_${groupCounter}" value="1" min="0" oninput="renderDynamicGroupTable(${groupCounter})"></div>
                <div class="form-grid-cell"><label>عدد المجهين المطلوبين للمجموعة</label><input type="number" id="g_clergy_${groupCounter}" value="1" min="0" oninput="renderDynamicGroupTable(${groupCounter})"></div>
                <div class="form-grid-cell bg-empty"></div>
            </div>

            <div class="section-title" style="background-color: #555; font-size:12px;">📋 كادر المجموعة الداخلي رقم (${groupCounter})</div>
            <table>
                <thead>
                    <tr><th style="width:15%;">الرقم</th><th style="width:35%;">الصفة المعتمدة ضمن المجموعة</th><th style="width:50%;">الاسم والمراسلة الفورية الفعّالة</th></tr>
                </thead>
                <tbody id="groupTableBody_${groupCounter}">
                    <tr><td colspan="3" class="table-placeholder">يرجى اختيار رئيس المجموعة لتوليد بيانات الكادر الداخلي...</td></tr>
                </tbody>
            </table>
        </div>
    `;
    
    wrapper.insertAdjacentHTML('beforeend', groupHtml);
    populateGroupLeaderDropdown(groupCounter);
    updateTotalGroupsAndCategoriesCount();
}

// تعبئة قائمة رؤساء المجموعات ديناميكياً لكل مجموعة جديدة تضاف للمنصة
function populateGroupLeaderDropdown(id) {
    var selectElement = document.getElementById(`g_leader_select_${id}`);
    if(!selectElement) return;
    selectElement.innerHTML = '<option value="">-- ابحث واختر رئيس المجموعة --</option>';
    staffDb.forEach(function(person) {
        if(person.الصفة === "رئيس مجموعة") {
            selectElement.innerHTML += `<option value="${person.الاسم}">${person.الاسم}</option>`;
        }
    });
}

// المزامنة والربط الأوتوماتيكي: جلب هاتف ومكتب وفئة رئيس المجموعة تلقائياً فور اختياره
function syncDynamicGroupLeaderData(id) {
    var selectedLeader = document.getElementById(`g_leader_select_${id}`).value;
    var phoneInput = document.getElementById(`g_leader_phone_${id}`);
    var officeInput = document.getElementById(`g_office_${id}`);
    var categoryInput = document.getElementById(`g_category_${id}`);

    var match = staffDb.find(s => s.الاسم === selectedLeader && s.الصفة === "رئيس مجموعة");
    if(match) {
        phoneInput.value = match.الهاتف || 'غير مدرج';
        officeInput.value = match.المكتب || 'مكتب المحافظة المعتمد'; // يعتمد على عمود المكتب في غوغل شيت
        categoryInput.value = match.الفئة || 'غير محدد'; // جلب وتعبئة الفئة تلقائياً من عمود الفئة في غوغل شيت
    } else {
        phoneInput.value = ''; officeInput.value = ''; categoryInput.value = '';
    }
    updateTotalGroupsAndCategoriesCount();
    renderDynamicGroupTable(id);
}

// تحديث إجمالي الأعداد بشكل حي في التحديد الأول التابع للتكتل
function updateTotalGroupsAndCategoriesCount() {
    document.getElementById('c_groups_num').value = groupCounter;
    
    var uniqueCategories = new Set();
    for(var i = 1; i <= groupCounter; i++) {
        var catVal = document.getElementById(`g_category_${i}`) ? document.getElementById(`g_category_${i}`).value : '';
        if(catVal && catVal !== 'غير محدد') uniqueCategories.add(catVal);
    }
    document.getElementById('c_categories_num').value = uniqueCategories.size > 0 ? uniqueCategories.size : '1';
}

// آلية توليد كادر المجموعة بشكل ديناميكي ومطابق للتكتل (بناءً على أعداد المعاون والموجه المكتوبة يدوياً)
function renderDynamicGroupTable(id) {
    var tbody = document.getElementById(`groupTableBody_${id}`);
    if(!tbody) return; tbody.innerHTML = '';
    
    var selectedLeader = document.getElementById(`g_leader_select_${id}`).value;
    if(!selectedLeader) {
        tbody.innerHTML = '<tr><td colspan="3" class="table-placeholder">يرجى اختيار رئيس المجموعة لتوليد بيانات الكادر الداخلي...</td></tr>';
        return;
    }

    resetStaffClaims();

    var assistants = parseInt(document.getElementById(`g_assistants_${id}`).value) || 0;
    var clergy = parseInt(document.getElementById(`g_clergy_${id}`).value) || 0;

    var groupRoles = [];
    for(var i=1; i<=assistants; i++) groupRoles.push("معاون");
    for(var j=1; j<=clergy; j++) groupRoles.push("موجه ديني");

    var index = 1;
    groupRoles.forEach(function(role) {
        appendRowToTable(tbody, index++, role);
    });
}

// خوارزمية التسكين الفريد وربط أرقام الجوال بمراسلات الواتساب الدولية الفورية
function appendRowToTable(tbody, rowIndex, role) {
    var tr = document.createElement('tr');
    var assignedName = "لم يُعين الاسم (يرجى مراجعة ترويسات الغوغل شيت)";
    var waHTML = '<span style="color:#999; font-size:12px;">🚫 رقم الهاتف غير مدرج</span>';

    var match = staffDb.find(function(s) { 
        return (s.الصفة === role || s.الصفة === "منسق ومعاون" || s.الصفة === "معاون بعدد" || s.الصفة === "موجه ديني - مرشد ديني") && !s.isTaken; 
    });

    if(match) {
        assignedName = match.الاسم; 
        match.isTaken = true;
        var phone = String(match.Toggle_Phone || match.الهاتف).replace(/\s+/g, '').replace('+', '');
        var encodedMsg = encodeURIComponent("السلام عليكم أخي الإداري المعتمد / " + assignedName + "، بصفتك (" + role + ") نرجو المتابعة الميدانية المعتمدة.");
        waHTML = '<a href="https://wa.me' + phone + '?text=' + encodedMsg + '" target="_blank" class="whatsapp-link">💬 مراسلة واتساب (' + assignedName + ')</a>';
    }

    tr.innerHTML = '<td>' + rowIndex + '</td><td><b>' + role + '</b></td><td>' + waHTML + '</td>';
    tbody.appendChild(tr);
}

// محرك تصدير كافة بيانات المجموعات الحية وكادر التكتل المعتمد لملف إكسل منظم
function exportFullClusterReport() {
    var clusterName = document.getElementById('c_name').value || "التكتل الرئيسي";
    var leaderName = document.getElementById('c_leader_select').value || "لم يُعين";
    
    var summaryData = [
        ["تقرير اعتماد التشكيل والتكتلات الميدانية السحابي - مديرية الحج والعمرة"],
        [""],
        ["اسم التكتل الرئيسي:", clusterName, "رئيس التكتل المعتمد:", leaderName],
        ["مكتب تسجيل التكتل:", document.getElementById('c_registration_office').value || "غير محدد", "رقم هاتف الرئيس:", document.getElementById('c_leader_phone').value || "غير محدد"],
        ["إجمالي المجموعات المنضوية الحية:", document.getElementById('c_groups_num').value, "عدد فئات التكتل الإجمالية:", document.getElementById('c_categories_num').value],
        [""]
    ];

    var wb = XLSX.utils.book_new();
    var ws = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws, "تقرير التشكيل المعتمد");
    
    var fileName = "تقرير_اعتماد_" + clusterName.replace(/\s+/g, '_') + ".xlsx";
    XLSX.writeFile(wb, fileName);
}

function resetEntireSystem() {
    if(confirm("هل أنت متأكد من تصفير المنصة بالكامل؟")) { location.reload(); }
}
