// 1. نظام الحماية وبوابة الدخول (Gatekeeper)
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('accessPasscode');
    const eyeIcon = document.getElementById('eyeIcon');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        eyeIcon.textContent = '👁️';
    }
}

function handleEnterKey(event) {
    if (event.key === 'Enter') {
        authenticateUserGateway();
    }
}

function authenticateUserGateway() {
    const passcode = document.getElementById('accessPasscode').value;
    const statusLog = document.getElementById('adminStatusLogs');
    
    // رمز افتراضي للتحقق والدخول إلى المنظومة
    if (passcode === "Hajj2026") { 
        document.getElementById('gatekeeperSystem').style.display = 'none';
        document.getElementById('mainHajjPlatform').style.display = 'block';
        statusLog.textContent = "🟢 متصل بالسحابة ومزامن بنجاح";
        initializeFormOptions();
    } else {
        alert("رمز الصلاحية المعتمد غير صحيح! يرجى التحقق وإعادة المحاولة.");
    }
}

// 2. إدارة وتوليد جدول كادر التكتل الرئيسي ديناميكياً بناءً على الأعداد المدخلة
function renderClusterStaffTable() {
    const tbody = document.getElementById('clusterTableBody');
    tbody.innerHTML = ""; // تصفية الجدول الحالي لإعادة البناء

    // مصفوفة المعرفات والمسميات الوظيفية الرسمية
    const roles = [
        { id: 'c_coord_num', name: 'منسق تكتل إداري' },
        { id: 'c_guides_num', name: 'موجهة دينية معتمدة' },
        { id: 'c_assistants_num', name: 'معاون رئيس التكتل' },
        { id: 'c_clergy_num', name: 'موجه ديني معتمد' }
    ];

    let globalIndex = 1;

    roles.forEach(role => {
        const count = parseInt(document.getElementById(role.id).value) || 0;
        for (let i = 0; i < count; i++) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${globalIndex++}</td>
                <td><strong>${role.name} #${i + 1}</strong></td>
                <td>
                    <select class="form-control select-staff-member">
                        <option value="">-- اختر الاسم من الكوادر المتاحة --</option>
                        <option value="1">أحمد محمد المصطفى</option>
                        <option value="2">محمود عبد الرحمن العلي</option>
                        <option value="3">فاطمة عمر الحمصي</option>
                    </select>
                </td>
            `;
            tbody.appendChild(row);
        }
    });
}

// 3. محرك جلب بيانات رئيس التكتل تلقائياً عند الاختيار
function syncClusterLeaderData() {
    const leaderSelect = document.getElementById('c_leader_select');
    const phoneInput = document.getElementById('c_leader_phone');
    const officeInput = document.getElementById('c_registration_office');

    if (leaderSelect.value !== "") {
        // بيانات افتراضية للمحاكاة (تستبدل لاحقاً ببيانات قاعدة البيانات)
        phoneInput.value = "+963-933-123456";
        officeInput.value = "مكتب دمشق المركزي - السبع بحرات";
    } else {
        phoneInput.value = "";
        officeInput.value = "";
    }
}

// 4. إضافة وإدارة أقسام المجموعات الفرعية الديناميكية
let groupCounter = 1;
function addNewDynamicGroupSection() {
    const wrapper = document.getElementById('dynamicGroupsWrapper');
    const groupSection = document.createElement('div');
    groupSection.className = 'group-card-container';
    groupSection.id = `group_section_${groupCounter}`;
    groupSection.style.border = "1px solid var(--primary)";
    groupSection.style.padding = "15px";
    groupSection.style.marginBottom = "15px";
    groupSection.style.background = "#fff";
    
    groupSection.innerHTML = `
        <div class="section-title" style="background: var(--primary-light); margin-top:0; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;">
            <span>📦 مجموعة فرعية رقم (${groupCounter}) ضمن التكتل</span>
            <button class="btn btn-danger" style="padding: 4px 10px; font-size: 11px;" onclick="removeGroupSection(${groupCounter})">🗑️ حذف المجموعة</button>
        </div>
        <div class="form-grid">
            <div class="form-grid-cell"><label>اسم/رقم المجموعة الفرعية</label><input type="text" value="مجموعة فرعية رقم ${groupCounter}"></div>
            <div class="form-grid-cell"><label>مشرف المجموعة المعتمد</label><input type="text" placeholder="اسم المشرف الثلاثي"></div>
            <div class="form-grid-cell"><label>عدد الحجاج الفعلي</label><input type="number" value="45" min="1" oninput="updateGroupMetrics()"></div>
            <div class="form-grid-cell"><label>فئة السكن والخدمة</label><select><option>فئة أ (مميز)</option><option>فئة ب (اقتصادي)</option><option>فئة ج</option></select></div>
            <div class="form-grid-cell"><label>مدينة الانطلاق</label><input type="text" value="دمشق"></div>
            <div class="form-grid-cell bg-empty"></div>
        </div>
    `;
    wrapper.appendChild(groupSection);
    groupCounter++;
    updateGroupMetrics();
}

function removeGroupSection(id) {
    const section = document.getElementById(`group_section_${id}`);
    if (section) {
        section.remove();
        updateGroupMetrics();
    }
}

// 5. تحديث الإحصائيات التلقائية للمجموعات والفئات
function updateGroupMetrics() {
    const wrapper = document.getElementById('dynamicGroupsWrapper');
    const totalGroups = wrapper.children.length;
    
    // تحديث عدد المجموعات المنضوية في الجدول العلوي
    document.getElementById('c_groups_num').value = totalGroups;
    
    // تحديث عدد الفئات تلقائياً
    if (totalGroups > 0) {
        document.getElementById('c_categories_num').value = `${totalGroups} مجموعات نشطة ميدانياً`;
    } else {
        document.getElementById('c_categories_num').value = "لا يوجد مجموعات مضافة";
    }
}

// 6. تهيئة الخيارات وتعبئة القوائم عند الإقلاع الناجح
function initializeFormOptions() {
    renderClusterStaffTable();
    
    // تعبئة قائمة رئيس التكتل بأسماء افتراضية للبدء فوراً
    const leaderSelect = document.getElementById('c_leader_select');
    const sampleLeaders = ["فضيلة الشيخ أحمد النابلسي", "الأستاذ محمد غياث الملاح", "الشيخ عبد الله الحريري"];
    
    sampleLeaders.forEach(leader => {
        const option = document.createElement('option');
        option.value = leader;
        option.textContent = leader;
        leaderSelect.appendChild(option);
    });
}

// 7. دالات إصدار المستندات والتقارير الرسمية
function generateOfficialPdfDecision() {
    // تشغيل أمر الطباعة المدمج بالمتصفح والذي يعتمد على تنسيق @media print المجهز في الـ CSS
    window.print();
}

function exportFullClusterReport() {
    alert("🔗 متصل بالسحابة: جاري تجميع بيانات الكوادر والمجموعات الفرعية لتوليد تقرير Excel المعتمد...");
}
