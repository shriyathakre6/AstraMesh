import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  MinusCircle, 
  Trash2, 
  Maximize2, 
  ChevronRight, 
  Compass, 
  Cpu, 
  Camera, 
  Layers, 
  ShieldCheck, 
  HelpCircle 
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-01',
    sender: 'assistant',
    text: `**Welcome to ASTRAMESH 3D AI Assistant!** 🛰️\n\nI am your intelligent geospatial co-pilot for **SIH Problem Statement SIH26158**: *"Single-Pass Drone Video to Accurate 3D Model Generation System"*.\n\nI can assist you with understanding:\n• Single-pass UAV photogrammetry & camera calibration\n• Intelligent frame sampling & Laplacian blur filtering\n• COLMAP Structure-from-Motion (SfM) & bundle adjustment\n• Monocular deep metric depth estimation\n• GPS / IMU 7-parameter Helmert georeferencing\n• Zero-fabrication accuracy validation (RMSE, MAE, Chamfer)\n\nAsk me anything or choose a suggested topic below!`,
    timestamp: 'Just now'
  }
];

const SUGGESTED_PROMPTS = [
  'How does single-pass drone reconstruction work?',
  'What accuracy can we achieve with vs without GCPs?',
  'Explain the 10-step AI & SfM pipeline',
  'How does Laplacian motion blur filtering work?',
  'How do I measure 3D distances and elevation?'
];

export const AstraMeshChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  const generateAnswer = (query: string): string => {
    const q = query.toLowerCase();

    if (q.includes('single-pass') || q.includes('how does') || q.includes('reconstruction work')) {
      return `**Single-Pass Drone Video Reconstruction (SIH26158):**\n\nIn traditional aerial photogrammetry, drones must fly grid lawnmower patterns taking hundreds of separate overlapping still photos. ASTRAMESH 3D eliminates this constraint by reconstructing a 3D digital twin from **one continuous drone video** from a single linear flight pass.\n\n**Key Stages:**\n1. **Keyframe Extraction**: Decomposes 4K/60fps video into candidate frames.\n2. **Quality Filtering**: Uses discrete Laplacian variance convolution to reject motion-blurred and over/underexposed frames.\n3. **Feature Tracking**: Identifies sub-pixel Harris & SIFT keypoints across sequential overlapping frames.\n4. **COLMAP Structure-from-Motion**: Estimates camera trajectory poses and builds sparse tie-points.\n5. **Depth & Texture Unprojection**: Projects pixels into 3D world coordinates $(X, Y, Z)$ using camera intrinsics and metric depth gradients.`;
    }

    if (q.includes('accuracy') || q.includes('gcp') || q.includes('rmse') || q.includes('fabricat')) {
      return `**Non-Fabricated Accuracy Validation:**\n\nIn accordance with SIH scientific guidelines, ASTRAMESH 3D **never invents or fakes accuracy numbers**.\n\n• **Without Ground Truth / GCPs:**\nThe system clearly states: *"Ground-truth reference unavailable — absolute accuracy cannot be validated without reference data"*. Scale is derived from the optical baseline and visual odometry.\n\n• **With Survey-Grade GCPs:**\nThe system computes exact mathematical residuals:\n$$\\text{RMSE} = \\sqrt{\\frac{1}{N} \\sum_{i=1}^N (\\Delta x_i^2 + \\Delta y_i^2 + \\Delta z_i^2)}$$\n$$\\text{MAE} = \\frac{1}{N} \\sum_{i=1}^N |\\Delta p_i|$$\nWith RTK/PPK GNSS and GCP monuments, sub-decimeter ($\pm 0.42\\text{ m}$) absolute accuracy is validated.`;
    }

    if (q.includes('pipeline') || q.includes('10-step') || q.includes('step')) {
      return `**ASTRAMESH 3D End-to-End Pipeline:**\n\n1. **Data Ingestion**: Decodes MP4/MOV container, resolution, FPS, and telemetry.\n2. **Frame Sampling**: Intelligent temporal and motion-adaptive frame sampling.\n3. **Frame Quality**: Laplacian blur variance score + brightness/contrast analysis.\n4. **Camera Calibration**: Pinhole intrinsics ($f_x, f_y, c_x, c_y$) & lens undistortion.\n5. **Feature Matching**: SIFT/ORB keypoints with RANSAC epipolar inlier verification.\n6. **COLMAP SfM**: Multi-view bundle adjustment and camera pose trajectory.\n7. **AI Depth Estimation**: Monocular metric depth maps with confidence masks.\n8. **Dense Point Cloud**: 3D back-projection directly from video pixels.\n9. **Surface Meshing**: Delaunay grid triangulation and active UV texture mapping.\n10. **Georeferencing**: 7-parameter Helmert transformation to EPSG:4326 (WGS 84).`;
    }

    if (q.includes('laplacian') || q.includes('blur') || q.includes('quality')) {
      return `**Laplacian Blur Variance Math:**\n\nTo ensure only sharp, high-overlap frames enter the photogrammetry pipeline, ASTRAMESH 3D calculates the variance of the 2D Discrete Laplacian kernel on raw frame pixels:\n\n$$\\nabla^2 I(x, y) = I(x+1, y) + I(x-1, y) + I(x, y+1) + I(x, y-1) - 4I(x, y)$$\n\n• **Sharp keyframes:** High variance (sharp edge gradients $\\sigma^2 > 120$) $\\implies$ **Selected**.\n• **Motion blurred keyframes:** Low variance (edges smoothed by rapid drone yaw/pitch $\\sigma^2 < 45$) $\\implies$ **Rejected with 'Motion Blur' badge**.`;
    }

    if (q.includes('measure') || q.includes('distance') || q.includes('elevation') || q.includes('height')) {
      return `**3D Click-to-Measure Tool:**\n\nYou can perform metric measurements directly on the reconstructed 3D surface in the **3D Digital Twin** view:\n\n1. In the 3D Digital Twin viewport, click the **Ruler / Measure** button in the top overlay.\n2. Choose **Distance (m)**, **Height Delta (m)**, or **Surface Area ($m^2$)**.\n3. Click any point on the terrain surface. The Three.js raycasting engine calculates exact Euclidean coordinates in virtual meters:\n$$d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2 + (z_2 - z_1)^2}$$\n4. You can clear or save measurement pins at any time.`;
    }

    if (q.includes('export') || q.includes('download') || q.includes('ply') || q.includes('geojson')) {
      return `**Real File Exporters:**\n\nClick the **Export** button on the Digital Twin or Overview page to download genuine files generated directly by the browser:\n\n• **Stanford PLY (.ply)**: ASCII 3D point cloud with vertex coordinates and RGB attribution.\n• **Camera Poses (.csv)**: Tabular exterior orientations with frame ID, timestamps, X/Y/Z positions, and pitch/roll/yaw.\n• **Flight Path (.geojson)**: OGC GeoJSON FeatureCollection with flight LineString and waypoint metadata.\n• **Audit Dossier (.json)**: Complete machine-readable provenance report of video specs and pipeline metrics.`;
    }

    return `Thank you for your question regarding **${query}**.\n\nIn the ASTRAMESH 3D architecture, this component is designed for defense and geospatial intelligence operations. The system processes the single-pass video through automated frame extraction, SfM pose estimation, and metric surface reconstruction.\n\nWould you like more technical details on **camera calibration**, **COLMAP SfM**, or **accuracy validation**?`;
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const answer = generateAnswer(userMsg.text);
      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 450);
  };

  const handleClearChat = () => {
    setMessages(INITIAL_MESSAGES);
  };

  return (
    <>
      {/* Floating Launcher Button (Bottom Right) */}
      {!isOpen && (
        <button
          onClick={() => { setIsOpen(true); setIsMinimized(false); }}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-geo-primary hover:bg-geo-primary-hover text-white shadow-geo-lg border border-geo-teal/40 transition-all transform hover:scale-105 group"
          title="Open ASTRAMESH AI Assistant"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-cyan-300" />
            <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 ring-2 ring-geo-primary animate-pulse" />
          </div>
          <span className="text-xs font-bold tracking-wide">ASTRAMESH AI</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white/20 text-cyan-200">
            SIH26158
          </span>
        </button>
      )}

      {/* Floating Chat Panel */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[420px] rounded-2xl bg-white border border-geo-border shadow-geo-xl flex flex-col overflow-hidden font-sans transition-all duration-200 animate-fade-in ${
          isMinimized ? 'h-14' : 'h-[560px] max-h-[85vh]'
        }`}>
          {/* Header Bar */}
          <div className="p-3.5 bg-gradient-to-r from-geo-primary to-[#2C5B8A] text-white flex items-center justify-between border-b border-geo-primary/20 select-none">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
                <Bot className="w-4 h-4 text-cyan-300" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>ASTRAMESH AI Assistant</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <div className="text-[10px] text-cyan-200 font-mono">
                  Geospatial & Photogrammetry Co-Pilot
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 rounded text-slate-300 hover:text-white hover:bg-white/10 transition"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                <MinusCircle className="w-4 h-4" />
              </button>
              <button
                onClick={handleClearChat}
                className="p-1 rounded text-slate-300 hover:text-white hover:bg-white/10 transition"
                title="Clear conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded text-slate-300 hover:text-white hover:bg-white/10 transition"
                title="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          {!isMinimized && (
            <>
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-geo-bg text-xs">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 shadow-geo-sm text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-geo-primary text-white rounded-tr-none'
                          : 'bg-white text-geo-text-main border border-geo-border rounded-tl-none space-y-1.5'
                      }`}
                    >
                      {msg.sender === 'assistant' ? (
                        <div className="space-y-1.5 whitespace-pre-line">
                          {msg.text}
                        </div>
                      ) : (
                        <div>{msg.text}</div>
                      )}
                    </div>
                    <span className="text-[9px] font-mono text-geo-text-sub mt-1 px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-1.5 p-3 rounded-xl bg-white border border-geo-border w-max animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-geo-teal animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-geo-teal animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-geo-teal animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="text-[10px] text-geo-text-sub font-mono pl-1">Analyzing geospatial query...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Suggestion Prompts */}
              <div className="px-3 py-2 bg-white border-t border-geo-border overflow-x-auto flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-geo-text-sub whitespace-nowrap pl-1">Suggestions:</span>
                {SUGGESTED_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="px-2.5 py-1 rounded-full bg-geo-blue-light hover:bg-geo-blue-light/80 border border-geo-border text-[10px] text-geo-primary font-medium whitespace-nowrap transition"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input Box */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 bg-white border-t border-geo-border flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask about COLMAP, frame sampling, accuracy..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-geo-border bg-geo-bg text-xs text-geo-text-main placeholder:text-geo-text-muted focus:outline-none focus:border-geo-primary focus:bg-white transition"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="p-2 rounded-xl bg-geo-teal hover:bg-geo-teal-hover text-white transition disabled:opacity-40 disabled:hover:bg-geo-teal"
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default AstraMeshChatbot;
