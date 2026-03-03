// ============================================
// إعدادات Firebase - تراث الشموخ
// ============================================

const firebaseConfig = {
    apiKey: "AIzaSyAS1IDyTzbbyihyjLGiZ3WErgxTR47X1bw",
    authDomain: "turath-alshumoukh.firebaseapp.com",
    projectId: "turath-alshumoukh",
    storageBucket: "turath-alshumoukh.firebasestorage.app",
    messagingSenderId: "790608598622",
    appId: "1:790608598622:web:74f557562413687a4446cf"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ============================================
// دوال التعامل مع المنتجات
// ============================================

// جلب كل المنتجات
async function getProducts() {
    try {
        const snapshot = await db.collection('products').get();
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // ترتيب حسب تاريخ الإنشاء (الأحدث أولاً)
        products.sort((a, b) => {
            const timeA = a.createdAt ? a.createdAt.seconds : 0;
            const timeB = b.createdAt ? b.createdAt.seconds : 0;
            return timeB - timeA;
        });
        return products;
    } catch (error) {
        console.error('خطأ في جلب المنتجات:', error);
        return [];
    }
}

// جلب المنتجات الظاهرة فقط (للموقع الرئيسي)
async function getVisibleProducts() {
    try {
        const snapshot = await db.collection('products').get();
        const products = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(p => !p.hidden);
        products.sort((a, b) => {
            const timeA = a.createdAt ? a.createdAt.seconds : 0;
            const timeB = b.createdAt ? b.createdAt.seconds : 0;
            return timeB - timeA;
        });
        return products;
    } catch (error) {
        console.error('خطأ في جلب المنتجات:', error);
        return [];
    }
}

// إضافة منتج جديد
async function addProduct(productData) {
    try {
        productData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        const docRef = await db.collection('products').add(productData);
        return docRef.id;
    } catch (error) {
        console.error('خطأ في إضافة المنتج:', error);
        throw error;
    }
}

// تعديل منتج
async function updateProduct(productId, productData) {
    try {
        await db.collection('products').doc(productId).update(productData);
    } catch (error) {
        console.error('خطأ في تعديل المنتج:', error);
        throw error;
    }
}

// حذف منتج
async function deleteProduct(productId) {
    try {
        await db.collection('products').doc(productId).delete();
    } catch (error) {
        console.error('خطأ في حذف المنتج:', error);
        throw error;
    }
}

// تحويل صورة إلى Base64 لتخزينها في Firestore
function imageToBase64(file) {
    return new Promise((resolve, reject) => {
        // Compress image before saving
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_SIZE = 800; // max width/height
                let width = img.width;
                let height = img.height;
                
                if (width > height && width > MAX_SIZE) {
                    height = (height * MAX_SIZE) / width;
                    width = MAX_SIZE;
                } else if (height > MAX_SIZE) {
                    width = (width * MAX_SIZE) / height;
                    height = MAX_SIZE;
                }
                
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to compressed JPEG
                const base64 = canvas.toDataURL('image/jpeg', 0.7);
                resolve(base64);
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
