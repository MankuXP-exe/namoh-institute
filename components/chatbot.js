/**
 * components/chatbot.js
 * NAMOH Institute — Floating AI Chat Widget
 * Pure vanilla JS, zero dependencies.
 * Communicates with /api/chat (Vercel serverless function).
 */

(function () {
    'use strict';

    // ─── Config ───────────────────────────────────────────────────────────────
    const WELCOME_MSG = "Hello! 👋 I'm the NAMOH Institute assistant. I can help you with course information, admissions, timings, and more. How can I help you today?";
    const SESSION_KEY = 'namoh_chat_history';
    const MAX_HISTORY = 20; // messages to keep in session

    // ─── State ────────────────────────────────────────────────────────────────
    let isOpen = false;
    let isSending = false;
    let history = [];   // { role, content } pairs sent to API

    // ─── Build DOM ────────────────────────────────────────────────────────────
    const styles = `
    /* ── Chat FAB button ── */
    #namoh-chat-fab {
      position: fixed;
      bottom: 96px;
      right: 24px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, #2563EB, #7C3AED);
      color: #fff;
      border: none;
      cursor: pointer;
      box-shadow: 0 2px 10px rgba(37,99,235,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.45rem;
      z-index: 9000;
      transition: transform 0.25s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s;
      animation: namoh-fab-pulse 2.8s infinite;
    }
    #namoh-chat-fab:hover {
      transform: scale(1.12);
      box-shadow: 0 4px 15px rgba(37,99,235,0.4);
    }
    #namoh-chat-fab .namoh-fab-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      width: 18px;
      height: 18px;
      background: #F59E0B;
      border-radius: 50%;
      border: 2px solid #fff;
      font-size: 0.55rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #000;
    }
    @keyframes namoh-fab-pulse {
      0%, 100% { box-shadow: 0 2px 10px rgba(37,99,235,0.3); }
      50%       { box-shadow: 0 4px 16px rgba(124,58,237,0.4); }
    }

    /* ── Chat Panel ── */
    #namoh-chat-panel {
      position: fixed;
      bottom: 164px;
      right: 24px;
      width: 356px;
      max-height: 520px;
      background: #0F172A;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(37,99,235,0.3);
      display: flex;
      flex-direction: column;
      z-index: 9001;
      overflow: hidden;
      transform: scale(0.8) translateY(20px);
      transform-origin: bottom right;
      opacity: 0;
      pointer-events: none;
      transition: transform 0.3s cubic-bezier(.34,1.56,.64,1), opacity 0.25s ease;
    }
    #namoh-chat-panel.namoh-open {
      transform: scale(1) translateY(0);
      opacity: 1;
      pointer-events: all;
    }
    @media (max-width: 400px) {
      #namoh-chat-panel {
        width: calc(100vw - 20px);
        right: 10px;
        bottom: 88px;
        max-height: 70vh;
        border-radius: 16px;
      }
      #namoh-chat-fab {
        bottom: 24px;
        right: 16px;
      }
    }

    /* ── Panel Header ── */
    #namoh-chat-header {
      background: linear-gradient(135deg, #1E3A8A, #2563EB 60%, #7C3AED);
      padding: 14px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      position: relative;
    }
    .namoh-ch-avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: rgba(255,255,255,0.18);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      flex-shrink: 0;
    }
    .namoh-ch-info { flex: 1; min-width: 0; }
    .namoh-ch-name {
      color: #fff;
      font-size: 0.9rem;
      font-weight: 700;
      line-height: 1.2;
    }
    .namoh-ch-status {
      color: rgba(255,255,255,0.75);
      font-size: 0.72rem;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .namoh-status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #10B981;
      animation: namoh-blink 2s infinite;
    }
    @keyframes namoh-blink {
      0%,100% { opacity: 1; } 50% { opacity: 0.3; }
    }
    #namoh-chat-close {
      background: rgba(255,255,255,0.12);
      border: none;
      color: #fff;
      font-size: 1rem;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.2s;
      flex-shrink: 0;
    }
    #namoh-chat-close:hover { background: rgba(255,255,255,0.25); }

    /* ── Messages Area ── */
    #namoh-chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      scroll-behavior: smooth;
    }
    #namoh-chat-messages::-webkit-scrollbar { width: 5px; }
    #namoh-chat-messages::-webkit-scrollbar-track { background: transparent; }
    #namoh-chat-messages::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.15);
      border-radius: 10px;
    }

    /* ── Message Bubbles ── */
    .namoh-msg {
      display: flex;
      gap: 8px;
      max-width: 88%;
      animation: namoh-msg-in 0.25s ease;
    }
    @keyframes namoh-msg-in {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .namoh-msg.namoh-user { align-self: flex-end; flex-direction: row-reverse; }
    .namoh-msg.namoh-bot  { align-self: flex-start; }

    .namoh-msg-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .namoh-bot .namoh-msg-avatar  { background: linear-gradient(135deg,#2563EB,#7C3AED); }
    .namoh-user .namoh-msg-avatar { background: linear-gradient(135deg,#F59E0B,#EF4444); color:#fff; }

    .namoh-msg-bubble {
      padding: 9px 13px;
      border-radius: 16px;
      font-size: 0.82rem;
      line-height: 1.5;
      word-break: break-word;
    }
    .namoh-bot  .namoh-msg-bubble {
      background: rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.9);
      border-bottom-left-radius: 4px;
    }
    .namoh-user .namoh-msg-bubble {
      background: linear-gradient(135deg, #2563EB, #1D4ED8);
      color: #fff;
      border-bottom-right-radius: 4px;
    }

    /* ── Typing Indicator ── */
    #namoh-typing {
      display: none;
      align-self: flex-start;
      align-items: center;
      gap: 8px;
    }
    #namoh-typing.namoh-visible { display: flex; }
    .namoh-typing-bubble {
      background: rgba(255,255,255,0.08);
      padding: 10px 14px;
      border-radius: 16px;
      border-bottom-left-radius: 4px;
      display: flex;
      gap: 5px;
      align-items: center;
    }
    .namoh-typing-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: rgba(255,255,255,0.5);
      animation: namoh-typing 1.2s infinite;
    }
    .namoh-typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .namoh-typing-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes namoh-typing {
      0%,80%,100% { transform: translateY(0); opacity: 0.5; }
      40%          { transform: translateY(-5px); opacity: 1; }
    }

    /* ── Input Area ── */
    #namoh-chat-input-area {
      padding: 12px 14px 14px;
      border-top: 1px solid rgba(255,255,255,0.08);
      display: flex;
      gap: 8px;
      align-items: flex-end;
    }
    #namoh-chat-input {
      flex: 1;
      background: rgba(255,255,255,0.07);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 12px;
      color: rgba(255,255,255,0.9);
      padding: 9px 13px;
      font-size: 0.82rem;
      font-family: inherit;
      resize: none;
      min-height: 40px;
      max-height: 100px;
      overflow-y: auto;
      outline: none;
      transition: border-color 0.2s;
      line-height: 1.4;
    }
    #namoh-chat-input::placeholder { color: rgba(255,255,255,0.35); }
    #namoh-chat-input:focus { border-color: rgba(37,99,235,0.7); }

    #namoh-chat-send {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #2563EB, #7C3AED);
      border: none;
      color: #fff;
      font-size: 1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: transform 0.2s, opacity 0.2s;
    }
    #namoh-chat-send:hover:not(:disabled) { transform: scale(1.1); }
    #namoh-chat-send:disabled { opacity: 0.45; cursor: not-allowed; }

    /* ── Quick Prompts ── */
    #namoh-quick-prompts {
      padding: 0 14px 8px;
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .namoh-qp {
      background: rgba(37,99,235,0.15);
      border: 1px solid rgba(37,99,235,0.35);
      color: rgba(255,255,255,0.8);
      border-radius: 20px;
      padding: 4px 11px;
      font-size: 0.72rem;
      cursor: pointer;
      transition: background 0.2s;
      font-family: inherit;
    }
    .namoh-qp:hover { background: rgba(37,99,235,0.3); }
  `;

    // ─── Inject Styles ────────────────────────────────────────────────────────
    const styleEl = document.createElement('style');
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);

    // ─── Inject HTML ─────────────────────────────────────────────────────────
    const fabHTML = `
    <button id="namoh-chat-fab" aria-label="Chat with NAMOH Institute assistant" title="Chat with us">
      💬
      <span class="namoh-fab-badge" id="namoh-fab-badge">1</span>
    </button>
  `;

    const panelHTML = `
    <div id="namoh-chat-panel" role="dialog" aria-label="NAMOH Institute Chat" aria-modal="true">
      <div id="namoh-chat-header">
        <div class="namoh-ch-avatar">🎓</div>
        <div class="namoh-ch-info">
          <div class="namoh-ch-name">NAMOH Institute Assistant</div>
          <div class="namoh-ch-status">
            <span class="namoh-status-dot"></span> Online — Ask me anything!
          </div>
        </div>
        <button id="namoh-chat-close" aria-label="Close chat">✕</button>
      </div>

      <div id="namoh-chat-messages" role="log" aria-live="polite">
        <!-- messages injected here -->
        <div class="namoh-msg namoh-bot">
          <div class="namoh-msg-avatar">🎓</div>
          <div class="namoh-msg-bubble">${WELCOME_MSG}</div>
        </div>
        <div id="namoh-typing" class="namoh-msg namoh-bot">
          <div class="namoh-msg-avatar">🎓</div>
          <div class="namoh-typing-bubble">
            <div class="namoh-typing-dot"></div>
            <div class="namoh-typing-dot"></div>
            <div class="namoh-typing-dot"></div>
          </div>
        </div>
      </div>

      <div id="namoh-quick-prompts">
        <button class="namoh-qp" data-q="What courses do you offer?">📚 Courses</button>
        <button class="namoh-qp" data-q="What are the batch timings?">⏰ Timings</button>
        <button class="namoh-qp" data-q="How do I enroll or get admission?">🎓 Admission</button>
        <button class="namoh-qp" data-q="Tell me about the Spoken English course.">🗣️ Spoken English</button>
      </div>

      <div id="namoh-chat-input-area">
        <textarea
          id="namoh-chat-input"
          placeholder="Type your question..."
          rows="1"
          aria-label="Type your message"
          maxlength="500"
        ></textarea>
        <button id="namoh-chat-send" aria-label="Send message">➤</button>
      </div>
    </div>
  `;

    document.body.insertAdjacentHTML('beforeend', fabHTML + panelHTML);

    // ─── Elements ─────────────────────────────────────────────────────────────
    const fab = document.getElementById('namoh-chat-fab');
    const panel = document.getElementById('namoh-chat-panel');
    const closeBtn = document.getElementById('namoh-chat-close');
    const messagesEl = document.getElementById('namoh-chat-messages');
    const typingEl = document.getElementById('namoh-typing');
    const inputEl = document.getElementById('namoh-chat-input');
    const sendBtn = document.getElementById('namoh-chat-send');
    const badge = document.getElementById('namoh-fab-badge');
    const quickPrompts = document.querySelectorAll('.namoh-qp');

    // ─── Helpers ──────────────────────────────────────────────────────────────
    function escapeHTML(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/\n/g, '<br>');
    }

    function appendMessage(role, text) {
        const wrapper = document.createElement('div');
        wrapper.className = `namoh-msg namoh-${role}`;

        const avatar = document.createElement('div');
        avatar.className = 'namoh-msg-avatar';
        avatar.textContent = role === 'bot' ? '🎓' : '👤';

        const bubble = document.createElement('div');
        bubble.className = 'namoh-msg-bubble';
        bubble.innerHTML = escapeHTML(text);

        wrapper.appendChild(avatar);
        wrapper.appendChild(bubble);

        // Insert before the typing indicator
        messagesEl.insertBefore(wrapper, typingEl);
        scrollToBottom();
    }

    function scrollToBottom() {
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function setTyping(visible) {
        typingEl.classList.toggle('namoh-visible', visible);
        if (visible) scrollToBottom();
    }

    function setSending(val) {
        isSending = val;
        sendBtn.disabled = val;
        inputEl.disabled = val;
    }

    function resizeInput() {
        inputEl.style.height = 'auto';
        inputEl.style.height = Math.min(inputEl.scrollHeight, 100) + 'px';
    }

    // ─── Open / Close ─────────────────────────────────────────────────────────
    function openChat() {
        isOpen = true;
        panel.classList.add('namoh-open');
        badge.style.display = 'none';
        fab.setAttribute('aria-expanded', 'true');
        inputEl.focus();
        scrollToBottom();
    }

    function closeChat() {
        isOpen = false;
        panel.classList.remove('namoh-open');
        fab.setAttribute('aria-expanded', 'false');
    }

    fab.addEventListener('click', () => (isOpen ? closeChat() : openChat()));
    closeBtn.addEventListener('click', closeChat);

    // Close on Escape key
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && isOpen) closeChat();
    });

    // ─── Send Message ─────────────────────────────────────────────────────────
    async function sendMessage(text) {
        text = text.trim();
        if (!text || isSending) return;

        // Hide quick prompts after first real interaction
        document.getElementById('namoh-quick-prompts').style.display = 'none';

        appendMessage('user', text);
        history.push({ role: 'user', content: text });

        // Keep history bounded
        if (history.length > MAX_HISTORY) history = history.slice(-MAX_HISTORY);

        setSending(true);
        setTyping(true);
        inputEl.value = '';
        resizeInput();

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    history: history.slice(0, -1), // don't repeat the last user msg
                }),
            });

            let data = {};
            try {
                data = await res.json();
            } catch (_) {
                if (!res.ok) throw new Error(`Request failed: ${res.status}`);
            }

            const reply = data.reply || data.message || 'Sorry, I could not get a response. Please try again.';
            setTyping(false);
            appendMessage('bot', reply);
            history.push({ role: 'assistant', content: reply });

            // Persist to session
            try {
                sessionStorage.setItem(SESSION_KEY, JSON.stringify(history.slice(-MAX_HISTORY)));
            } catch (_) { /* storage full — ignore */ }

        } catch (err) {
            setTyping(false);
            appendMessage(
                'bot',
                "I'm having trouble connecting right now 😔 For immediate help, please call us at +91 9991919261 — we're available Mon–Sat, 8 AM to 8 PM!"
            );
        } finally {
            setSending(false);
            inputEl.focus();
        }
    }

    // ─── Event Listeners ──────────────────────────────────────────────────────
    sendBtn.addEventListener('click', () => sendMessage(inputEl.value));

    inputEl.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(inputEl.value);
        }
    });

    inputEl.addEventListener('input', resizeInput);

    quickPrompts.forEach(btn => {
        btn.addEventListener('click', () => sendMessage(btn.dataset.q));
    });

    // ─── Restore session history ──────────────────────────────────────────────
    try {
        const saved = sessionStorage.getItem(SESSION_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                history = parsed;
                // Re-render saved messages (skip the first welcome from HTML)
                history.forEach(m => {
                    if (m.role === 'user') appendMessage('user', m.content);
                    else if (m.role === 'assistant') appendMessage('bot', m.content);
                });
                document.getElementById('namoh-quick-prompts').style.display = 'none';
            }
        }
    } catch (_) { /* ignore */ }

    // Show badge hint after 3 seconds to draw attention
    setTimeout(() => {
        if (!isOpen) {
            badge.style.display = 'flex';
        }
    }, 3000);

})();
