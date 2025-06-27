import streamlit as st
import google.generativeai as genai

# --- CẤU HÌNH BAN ĐẦU ---

# 1. Cấu hình API key an toàn
try:
    # Lấy API key từ Streamlit secrets một cách chính xác
    genai.configure(api_key=st.secrets["GOOGLE_API_KEY"])
except (KeyError, FileNotFoundError):
    st.error("Lỗi: Không tìm thấy GOOGLE_API_KEY trong Streamlit secrets. Vui lòng tạo và cấu hình file .streamlit/secrets.toml")
    st.stop() # Dừng ứng dụng nếu không có key

# 2. Định nghĩa prompt hệ thống (tốt hơn khi tách riêng)
SYSTEM_PROMPT = """
Bạn là một trợ lý ảo chuyên gia về tài chính phi tập trung (DeFi). 
Nhiệm vụ của bạn là trả lời các câu hỏi của người dùng một cách chính xác, dễ hiểu và an toàn.
Hãy luôn nhấn mạnh tầm quan trọng của việc tự nghiên cứu (DYOR - Do Your Own Research) và các rủi ro bảo mật.
Tuyệt đối không đưa ra lời khuyên đầu tư tài chính trực tiếp. Thay vào đó, hãy giải thích các khái niệm.
"""

# 3. Khởi tạo mô hình và bắt đầu cuộc trò chuyện
# Chúng ta sẽ sử dụng tính năng chat của model để nó có thể nhớ ngữ cảnh
model = genai.GenerativeModel('gemini-1.5-flash')
chat = model.start_chat(history=[
    # Bắt đầu với vai trò và chỉ dẫn hệ thống
    {'role': 'user', 'parts': [SYSTEM_PROMPT]},
    {'role': 'model', 'parts': ["Chào bạn, tôi là trợ lý DeFi. Bạn cần hỏi gì về giao dịch, ví điện tử, hay bảo mật?"]}
])

# --- GIAO DIỆN STREAMLIT ---
st.set_page_config(page_title="Chatbot DeFi", page_icon="🤖")
st.title("🤖 Chatbot Tư vấn DeFi (Tích hợp Gemini)")
st.caption("Trợ lý ảo giúp bạn hiểu rõ hơn về thế giới Tài chính Phi tập trung")


# 4. Khởi tạo và quản lý lịch sử chat bằng session_state
if "messages" not in st.session_state:
    # Lấy lịch sử khởi tạo từ chat object
    st.session_state.messages = [
        {"role": "assistant", "content": chat.history[-1].parts[0].text}
    ]

# 5. Hiển thị các tin nhắn đã có trong lịch sử
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# 6. Sử dụng st.chat_input để có giao diện chat hiện đại
if prompt := st.chat_input("💬 Nhập câu hỏi của bạn..."):
    # Thêm câu hỏi của người dùng vào lịch sử và hiển thị
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    # Gửi câu hỏi đến Gemini và nhận câu trả lời
    with st.chat_message("assistant"):
        with st.spinner("Bot đang suy nghĩ..."):
            try:
                # Gửi prompt của người dùng đến chat session đang hoạt động
                response = chat.send_message(prompt)
                full_response = response.text
                st.markdown(full_response)
                # Thêm câu trả lời của bot vào lịch sử
                st.session_state.messages.append({"role": "assistant", "content": full_response})
            except Exception as e:
                error_message = f"Đã xảy ra lỗi: {e}"
                st.error(error_message)
                st.session_state.messages.append({"role": "assistant", "content": error_message})