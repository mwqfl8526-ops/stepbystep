// ملف لإدارة البيانات (Local Storage كمحاكاة لقاعدة بيانات)

window.KEYS = {
    HOTELS: 'app_hotels_data',
    RESTAURANTS: 'app_restaurants_data',
    STORES: 'app_stores_data',
    BOOKINGS: 'app_orders_data',
    COMMENTS: 'app_comments_data' // المفتاح الخاص بالتعليقات
};

// دالة تحميل جميع البيانات من Local Storage
window.loadData = function() {
    const data = {};
    for (const key in window.KEYS) {
        if (window.KEYS.hasOwnProperty(key)) {
            const storageKey = window.KEYS[key];
            const stored = localStorage.getItem(storageKey);
            
            let defaultValue;
            if (storageKey === window.KEYS.BOOKINGS || storageKey === window.KEYS.COMMENTS) {
                defaultValue = {};
            } else {
                defaultValue = [];
            }

            try {
                data[storageKey] = stored ? JSON.parse(stored) : defaultValue;
            } catch (e) {
                console.error(`Error parsing data for key ${storageKey}:`, e);
                data[storageKey] = defaultValue;
            }
        }
    }
    return data;
};

// دالة لحفظ جزء معين من البيانات في Local Storage
window.saveDataToStorage = function(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error(`Error saving data for key ${key}:`, e);
        return false;
    }
};

// توليد كود عشوائي بسيط وكلمة سر
function generateCode() {
    return Math.random().toString(36).substring(2, 6).toUpperCase();
}
function generatePassword() {
    return Math.random().toString(36).substring(2, 8);
}

// دالة لحفظ عنصر جديد (مكان)
window.saveContentItem = function(key, itemData) {
    const data = window.loadData();
    const list = data[key] || [];
    
    const code = generateCode();
    const password = generatePassword();

    const newItem = {
        code: code,
        password: password,
        ...itemData
    };
    
    list.push(newItem);
    if (window.saveDataToStorage(key, list)) {
        return { code: code, password: password };
    }
    return null;
};

// دوال دعم التعليقات والتقييمات
window.saveComment = function(placeCode, commentData) {
    const commentsKey = window.KEYS.COMMENTS;
    const data = window.loadData();
    const comments = data[commentsKey] || {};
    
    if (!comments[placeCode]) {
        comments[placeCode] = [];
    }
    
    comments[placeCode].push(commentData);
    
    // حفظ الكائن الكامل للتعليقات
    return window.saveDataToStorage(commentsKey, comments);
};

window.getComments = function(placeCode) {
    const data = window.loadData();
    const comments = data[window.KEYS.COMMENTS] || {};
    return comments[placeCode] || [];
};
