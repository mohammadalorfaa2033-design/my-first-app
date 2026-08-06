// 🌐 الرابط السحابي المباشر الخاص بملف غوغل شيت لفلترة الأسماء سحابياً حياً
// (قم باستبدال العبارة والرموز المبهة بالرابط الفعلي المأخوذ من خطوة النشر للويب بصيغة CSV)
const googleSheetCsvUrl = "⚠️ ضع_هنا_رابط_الـ_CSV_الذي_نسخته_من_خطوة_النشر ⚠️";

var staffDb = [];
var groupCounter = 0; // عداد المجموعات المنضوية المضافة ديناميكياً للمنصة

// ⌨️ رصد ضغط زر Enter على لوحة المفاتيح للدخول الصامت والمباشر
function handleEnterKey(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        authenticateUserGateway(); // تشغيل دالة بوابة التحقق فوراً
    }
}

// 👁️ إظهار وإخفاء رمز الصلاحية (النجوم) داخل واجهة الدخول
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

// 🔓 دالة التحقق الرقمي والدخول الفوري الصامت بدون رسائل تأكيد منبثقة
function authenticateUserGateway() {
    var inputCode = document.getElementById('accessPasscode').value.trim();
    var authGate = document.getElementById('gatekeeperSystem');
    var mainPlatform = document.getElementById('mainHajjPlatform');

    if (!inputCode) { 
        alert("⚠️ فضلاً، أدخل رمز الصلاحية أولاً!"); 
        return; 
    }

    // الانتقال مباشر وصامت تماماً وبدون لوحات تحكم فرعية معلقة
    if (inputCode === "main123456" || inputCode === "admn123") {
        authGate.style.display = 'none';
        mainPlatform.style.display = 'block';
        initializePlatformUI();
    } else {
        alert("❌ رمز الصلاحية المكتوب غير مسجل بنظام المديرية!");
    }
}

// ⚙️ تهيئة الواجهة وبدء المزامنة السحابية فور تسجيل الدخول
function initializePlatformUI() {
    // [تم الإصلاح الحاسم]: تم حذف سطر الـ liveDate تماماً لمنع تجمد المنصة ولتفادي خطأ السطر 52 نهائياً
    fetchStaffFromGoogleSheets();
}

// ⏳ دالة الاتصال بالسحابة وتفكيك نصوص الـ CSV القادمة حياً من غوغل شيت
function fetchStaffFromGoogleSheets() {
    if(!googleSheetCsvUrl || googleSheetCsvUrl.includes("⚠️")) {
        document.getElementById('adminStatusLogs').innerText = '⚠️ المنصة تعمل محلياً بانتظار ربط السحابة.';
        renderClusterStaffTable();
        addNewDynamicGroupSection(); 
        return;
    }
    
    document.getElementById('adminStatusLogs').innerText = '⏳ جاري الاتصال بالسحابة ومزامنة الكوادر الحية...';
    
    fetch(googleSheetCsvUrl)
        .then(response => {
            if (!response.ok) throw new Error('Network error');
            return response.text();
        })
        .then(csvText => {
            var workbook = XLSX.read(csvText, {type: 'string'});
            var firstSheetName = workbook.SheetNames[0];
            var worksheet = workbook.Sheets[firstSheetName];
            staffDb = XLSX.utils.sheet_to_json(worksheet);
            
            document.getElementById('adminStatusLogs').innerText = '✅ تم التحديث السحابي! جلب عدد (' + staffDb.length + ') اسم كادر معتمد حياً.';
            
            populateClusterLeaderDropdown();
            renderClusterStaffTable();
            addNewDynamicGroupSection(); // توليد المجموعة الأولى تلقائياً عند استلام البيانات
        })
        .catch(error => {
            console.error("Error loading sheet:", error);
            document.getElementById('adminStatusLogs').innerText = '❌ فشل الاتصال بالسحابة، تحقق من نشر الـ CSV.';
            renderClusterStaffTable();
            addNewDynamicGroupSection();
        });
}

// 🗂️ تعبئة قائمة رئيس التكتل تلقائياً من مصفوفة السحابة المجلوبة
function populateClusterLeaderDropdown() {
    var leaderSelect = document.getElementById('c_leader_select');
    if(!leaderSelect) return;
    leaderSelect.innerHTML = '<option value="">-- ابحث واختر رئيس التكتل --</option>';
    staffDb.forEach(function(person) {
        if(person.الصفة === "رئيس تكتل") {
            leaderSelect.innerHTML += '<option value="' + person.الاسم + '">' + person.الاسم + '</option>';
        }
    });
}

// 📊 المزامنة الآلية: جلب الهاتف ومكتب التسجيل تلقائياً فور اختيار رئيس التكتل الرئيسي
function syncClusterLeaderData() {
    var selectedLeader = document.getElementById('c_leader_select').value;
    var phoneInput = document.getElementById('c_leader_phone');
    var officeInput = document.getElementById('c_registration_office');
    
    var match = staffDb.find(s => s.الاسم === selectedLeader && s.الصفة === "رئيس تكتل");
    if(match) {
        phoneInput.value = match.الهاتف || 'غير مدرج';
        officeInput.value = match.المكتب || 'المكتب الرئيسي للمديرية'; // يبحث عن عمود "المكتب" بملفك
    } else {
        phoneInput.value = ''; officeInput.value = '';
    }
    renderClusterStaffTable();
}

// 🔄 تصفير حالة حجز الأسماء لضمان فرز وتوزيع نظيف ومنع تكرار الشخص في أكثر من وظيفة
function resetStaffClaims() {
    staffDb.forEach(s => s.isTaken = false);
}

// 📊 توليد وبناء جدول كادر التكتل الرئيسي بناءً على مدخلات الأعداد المطلوبة (معاون، منسق، إلخ)
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

// ➕ المحرك الميداني اللانهائي لتوليد المجموعات المنضوية ديناميكياً مع حقول إدخال الكوادر الخاصة بكل مجموعة
function addNewDynamicGroupSection() {
    groupCounter++;
    var wrapper = document.getElementById('dynamicGroupsWrapper');
    if(!wrapper) return;
    
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
                <div class="form-grid-cell"><label>عدد الموجهين المطلوبين للمجموعة</label><input type="number" id="g_clergy_${groupCounter}" value="1" min="0" oninput="renderDynamicGroupTable(${groupCounter})"></div>
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

// تعبئة قوائم الاختيار لرؤساء المجموعات ديناميكياً لكل قسم جديد يضاف للمنصة
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

// المزامنة والربط الأوتوماتيكي: جلب هاتف ومكتب وفئة رئيس المجموعة تلقائياً فور اختياره من السحابة
function syncDynamicGroupLeaderData(id) {
    var selectedLeader = document.getElementById(`g_leader_select_${id}`).value;
    var phoneInput = document.getElementById(`g_leader_phone_${id}`);
    var officeInput = document.getElementById(`g_office_${id}`);
    var categoryInput = document.getElementById(`g_category_${id}`);

    var match = staffDb.find(s => s.الاسم === selectedLeader && s.الصفة === "رئيس مجموعة");
    if(match) {
        phoneInput.value = match.الهاتف || 'غير مدرج';
        officeInput.value = match.المكتب || 'مكتب المحافظة المعتمد'; // يبحث عن عمود "المكتب" بغوغل شيت
        categoryInput.value = match.الفئة || 'غير محدد'; // يبحث عن عمود "الفئة" بغوغل شيت
    } else {
        phoneInput.value = ''; officeInput.value = ''; categoryInput.value = '';
    }
    updateTotalGroupsAndCategoriesCount();
    renderDynamicGroupTable(id);
}

// تحديث الأعداد الإجمالية (عدد المجموعات وعدد الفئات الفريدة) تلقائياً في حقول التحديد الأول للتكتل الرئيسي
function updateTotalGroupsAndCategoriesCount() {
    var groupsCountInput = document.getElementById('c_groups_num');
    if(groupsCountInput) groupsCountInput.value = groupCounter;
    
    var uniqueCategories = new Set();
    for(var i = 1; i <= groupCounter; i++) {
        var catVal = document.getElementById(`g_category_${i}`) ? document.getElementById(`g_category_${i}`).value : '';
        if(catVal && catVal !== 'غير محدد') uniqueCategories.add(catVal);
    }
    var catCountInput = document.getElementById('c_categories_num');
    if(catCountInput) catCountInput.value = uniqueCategories.size > 0 ? uniqueCategories.size : '1';
}

// آلية توليد وتسكين كادر المجموعة ديناميكياً وبشكل يدوي مرن مطابق تماماً لآلية التكتل الرئيسي
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

// خوارزمية البحث والفرز المرن وحجز الأسماء مع تهيئة وتوليد روابط مراسلات الواتساب الفورية الدولية
function appendRowToTable(tbody, rowIndex, role) {
    var tr = document.createElement('tr');
    var assignedName = "لم يُعين الاسم";
    var waHTML = '<span style="color:#999; font-size:12px;">🚫 رقم الهاتف غير مدرج</span>';

    var match = staffDb.find(function(s) { 
        return (s.الصفة === role || s.الصفة === "منسق ومعاون" || s.الصفة === "معاون بعدد" || s.الصفة === "موجه ديني - مرشد ديني") && !s.isTaken; 
    });

    if(match) {
        assignedName = match.الاسم; 
        match.isTaken = true;
        var phone = String(match.الهاتف).replace(/\s+/g, '').replace('+', '');
        var encodedMsg = encodeURIComponent("السلام عليكم أخي الإداري المعتمد / " + assignedName + "، بصفتك (" + role + ") نرجو المتابعة الميدانية المعتمدة.");
        waHTML = '<a href="https://wa.me' + phone + '?text=' + encodedMsg + '" target="_blank" class="whatsapp-link">💬 مراسلة واتساب (' + assignedName + ')</a>';
    }

    tr.innerHTML = '<td>' + rowIndex + '</td><td><b>' + role + '</b></td><td>' + waHTML + '</td>';
    tbody.appendChild(tr);
}

// محرك تصدير كافة بيانات المجموعات الفرعية الحية وكادر التكتل الرئيسي لملف إكسل معتمد ومبوب
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
    XLSX.utils.book_append_sheet(wb, wb.SheetNames[0] || ws, "تقرير التشكيل المعتمد");
    
    var fileName = "تقرير_اعتماد_" + clusterName.replace(/\s+/g, '_') + ".xlsx";
    XLSX.writeFile(wb, fileName);
}
