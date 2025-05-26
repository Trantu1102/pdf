// Cấu hình webhook
const WEBHOOK_CONFIG = {
    webhook1: {
        url: 'https://n8n.autowf.xyz/webhook/c805678e-31f8-49e5-89b4-010e0bd2b372',
        name: 'PDF to Word'
    },
    webhook2: {
        url: 'https://n8n.autowf.xyz/webhook/c6071220-9ef7-4611-a050-40bfa4867ff0',
        name: 'PDF to Google Docs'
    },
    webhook3: {
       
        url: 'https://n8n.autowf.xyz/webhook/bf32de1d-e90d-40f3-9c55-9e222316a7cd',
        name: 'Image to text'
    }
    
};

// Khởi tạo ứng dụng
document.addEventListener('DOMContentLoaded', () => {
    const driveInput = document.getElementById('driveLink');
    const webhook1Btn = document.getElementById('webhook1Btn');
    const webhook2Btn = document.getElementById('webhook2Btn');
    const webhook3Btn = document.getElementById('webhook3Btn');
    const statusMessage = document.getElementById('statusMessage');
    
    // Xử lý nhấn Enter
    driveInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            webhook1Btn.click();
        }
    });
    
    // Xử lý nút webhook 1
    webhook1Btn.addEventListener('click', () => {
        handleSubmit(WEBHOOK_CONFIG.webhook1.url, driveInput.value, statusMessage, webhook1Btn, 'PDF to Word');
    });
    
    // Xử lý nút webhook 2
    webhook2Btn.addEventListener('click', () => {
        handleSubmit(WEBHOOK_CONFIG.webhook2.url, driveInput.value, statusMessage, webhook2Btn, 'PDF to Google Docs');
    });
    // Xử lý nút webhook 3
    webhook3Btn.addEventListener('click', () => {
        handleSubmit(WEBHOOK_CONFIG.webhook3.url, driveInput.value, statusMessage, webhook3Btn, 'Image to text');
    });
});

async function handleSubmit(webhookUrl, driveLink, statusElement, button, webhookName) {
    if (!driveLink) {
        showStatus(statusElement, 'Vui lòng nhập link Google Drive', 'error');
        return;
    }
    
    if (!isValidDriveLink(driveLink)) {
        showStatus(statusElement, 'Link Google Drive không hợp lệ', 'error');
        return;
    }
    
    try {
        button.disabled = true;
        button.innerHTML = '<span class="btn-icon">⏳</span> Đang gửi đến ' + webhookName + '...';
        showStatus(statusElement, 'Đang gửi dữ liệu đến ' + webhookName + '...', 'loading');
        
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                link: driveLink,
                timestamp: new Date().toISOString()
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            showStatus(statusElement, `Gửi thành công đến ${webhookName}!`, 'success');
            showResult(data);
        } else {
            const error = await response.text();
            throw new Error(error || 'Lỗi không xác định từ server');
        }
    } catch (error) {
        console.error('Error:', error);
        showStatus(statusElement, `Lỗi khi gửi đến ${webhookName}: ${error.message}`, 'error');
    } finally {
        button.disabled = false;
        button.innerHTML = '<span class="btn-icon">📤</span> Gửi đến ' + webhookName;
    }
}

// Các hàm phụ trợ giữ nguyên
function showStatus(element, message, type) {
    element.textContent = message;
    element.className = `status-message ${type}`;
}

function isValidDriveLink(link) {
    return /https?:\/\/drive\.google\.com\/.+/.test(link);
}

function showResult(response) {
    const resultArea = document.getElementById('resultArea');
    
    // Xử lý response là mảng
    if (Array.isArray(response)) {
        response = response[0];
    }
    
    // Lấy URL từ response và loại bỏ backtick
    const url = response?.downloadUrl?.replace(/`/g, '').trim() || 'Không tìm thấy link download.';
    resultArea.value = url;
}