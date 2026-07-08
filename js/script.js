// js/script.js - 파이어베이스 웹 최신 버전 (CDN 방식) 통합본
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 1. 파이어베이스 설정 및 초기화 (최신 v10 버전 통일)
const firebaseConfig = {
    apiKey: "AIzaSyDuCP7XEtUet0ABfgBpv-CVXc3aUOl586s",
    authDomain: "insurance-6676d.firebaseapp.com",
    projectId: "insurance-6676d",
    storageBucket: "insurance-6676d.firebasestorage.app",
    messagingSenderId: "397479316628",
    appId: "1:397479316628:web:e4d70f9b3bf045c9183881"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
console.log("파이어베이스 챗봇 & DB 서랍 연결 성공");

// 2. Dify API 설정 (본인 계정의 API Key로 교체 필수)
const DIFY_API_KEY = "app-abcd1234efgh5678..."; 
const DIFY_API_URL = "https://api.dify.ai/v1/chat-messages";

// HTML 요소 가져오기
const btnSend = document.getElementById('btn-send');
const userInput = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

/* ==========================================================================
   [세션 ID 매핑 시스템]
   ========================================================================== */
if (!sessionStorage.getItem('chat_session_id')) {
    sessionStorage.setItem('chat_session_id', 'user_' + Math.random().toString(36).substr(2, 9));
}
const sessionId = sessionStorage.getItem('chat_session_id');
console.log("현재 접속 사용자 세션 Key:", sessionId);


/* ==========================================================================
   [AI 챗봇 기능 구현 구역]
   ========================================================================== */

// 챗봇 대화 기록을 화면에 그리고 DB(chat_history_customer)에 쌓는 함수
async function saveMessage(sender, text) {
    if (!chatBox) return;
    
    // UI 화면에 말풍선 띄우기
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}`;
    msgDiv.innerText = text;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight; // 스크롤 자동 하단 고정

    // 파이어베이스 저장
    try {
        await addDoc(collection(db, "chat_history_customer"), {
            user_session: sessionId,
            sender: sender,
            message: text,
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error("Firestore 챗 기록 저장 에러:", error);
    }
}

// 봇 로딩 표시 애니메이션
function showLoadingIndicator() {
    if (!chatBox) return;
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message bot loading';
    loadingDiv.id = 'bot-loading';
    loadingDiv.innerText = '답변을 생각하고 있어요...';
    chatBox.appendChild(loadingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function removeLoadingIndicator() {
    const loadingDiv = document.getElementById('bot-loading');
    if (loadingDiv) loadingDiv.remove();
}

// 챗봇 전송 통합 처리 함수
async function handleSendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    userInput.value = ''; // 입력창 즉시 초기화
    await saveMessage('user', text);
    
    showLoadingIndicator(); // 로딩 시작

    try {
        const response = await fetch(DIFY_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${DIFY_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: {},
                query: text,
                user: sessionId,
                response_mode: "blocking"
            })
        });

        if (!response.ok) throw new Error(`API 호출 실패: ${response.status}`);

        const data = await response.json();
        const botReply = data.answer || data.event || "답변을 가져오지 못했습니다.";

        removeLoadingIndicator(); // 로딩 제거
        await saveMessage('bot', botReply);

    } catch (error) {
        console.error("Dify 통신 에러:", error);
        removeLoadingIndicator();
        await saveMessage('bot', "시스템 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    }
}

// 챗봇 이벤트 리스너 연결
if (btnSend) btnSend.addEventListener('click', handleSendMessage);
if (userInput) {
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.isComposing) {
            e.preventDefault();
            handleSendMessage();
        }
    });
}


/* ==========================================================================
   [상담 신청서 폼 제출 기능 구역]
   ========================================================================== */

// 폼 제출 이벤트 (최신 v10 방식으로 consultations 컬렉션에 저장)
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById('clientName').value;
    const phone = document.getElementById('clientPhone').value;
    const memo = document.getElementById('clientMemo').value || "없음";
    
    // 체크박스 중복 선택된 값 배열로 모으기
    const checkboxes = document.querySelectorAll('input[name="insurance_type"]:checked');
    let selectedTypes = [];
    checkboxes.forEach((checkbox) => {
        selectedTypes.push(checkbox.value);
    });

    try {
        // 구버전 db.collection().add() 대신 최신 addDoc() 사용
        await addDoc(collection(db, "consultations"), {
            name: name,
            phone: phone,
            interests: selectedTypes,
            memo: memo,
            createdAt: serverTimestamp() // 최신 서버타임스탬프 방식
        });

        alert(`${name}님, 맞춤 비대면 보장 분석 신청이 완료되었습니다.`);
        document.getElementById('consultForm').reset();
        window.goToMain(); // 신청 완료 후 첫 화면으로 이동
        
    } catch (error) {
        console.error("상담 신청 DB 저장 에러 발생: ", error);
        alert("접수 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    }
}


/* ==========================================================================
   [전화번호 실시간 하이픈 기능]
   ========================================================================== */
document.addEventListener("DOMContentLoaded", function() {
    const phoneInput = document.getElementById("clientPhone");
    if (phoneInput) {
        phoneInput.addEventListener("input", function(e) {
            let value = e.target.value.replace(/[^0-9]/g, "");
            if (value.length < 4) {
                e.target.value = value;
            } else if (value.length < 8) {
                e.target.value = value.substr(0, 3) + "-" + value.substr(3);
            } else {
                e.target.value = value.substr(0, 3) + "-" + value.substr(3, 4) + "-" + value.substr(7, 4);
            }
        });
    }
});


/* ==========================================================================
   [HTML onclick 연동을 위한 Window 전역 등록 필수 구역]
   ========================================================================== */

// 모든 페이지 단계를 리셋하는 헬퍼 함수
function allPagesInactive() {
    document.getElementById('step-main').classList.remove('active');
    document.getElementById('step-chatbot').classList.remove('active');
    document.getElementById('step-form').classList.remove('active');
}

window.goToMain = function() {
    allPagesInactive();
    document.getElementById('step-main').classList.add('active');
    window.scrollTo(0, 0);
};

window.goToChatbot = function() {
    allPagesInactive();
    document.getElementById('step-chatbot').classList.add('active');
    window.scrollTo(0, 0);
    
    // 챗봇 첫 진입 시 환영 인사말 자동 배치 (처음 한 번만)
    if (chatBox && chatBox.children.length === 0) {
        const welcomeDiv = document.createElement('div');
        welcomeDiv.className = "message bot";
        welcomeDiv.innerText = "안녕하세요! 어떤 보험 약관이나 보장 정보(뇌혈관/심장 질환 등)가 필요하신가요? 아래에 편하게 질문해주세요.";
        chatBox.appendChild(welcomeDiv);
    }
};

window.goToForm = function() {
    allPagesInactive();
    document.getElementById('step-form').classList.add('active');
    window.scrollTo(0, 0);
};

window.openModal = function() {
    document.getElementById('imageModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
};

window.closeModal = function() {
    document.getElementById('imageModal').style.display = 'none';
    document.body.style.overflow = 'auto';
};

// 폼 서브밋 함수 바인딩
window.handleFormSubmit = handleFormSubmit;
