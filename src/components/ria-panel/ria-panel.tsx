'use client';
import React, { useRef, useEffect, useState, KeyboardEvent } from 'react';
import { useRiaPanel } from '@/contexts/ria-panel-context';
import RiaChatMessage from './ria-chat-message';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, X, Bold, Plus, Mic } from 'lucide-react';

export default function RiaPanel() {
  const { 
    isRiaPanelOpen,
    setIsRiaPanelOpen, 
    messages, 
    advanceConversation, 
    isConversationOver,
    conversationStep
  } = useRiaPanel();
  
  const [inputText, setInputText] = useState('');
  const [showAttrSelector, setShowAttrSelector] = useState(false);
  const [userAttrMsg, setUserAttrMsg] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Mock attribute list for demo
  const mockAttributes = Array.from({ length: 20 }, (_, i) => ({ id: `attr${i+1}`, name: `Attribute ${i+1}` }));

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, userAttrMsg]);

  const handleSendMessage = () => {
    if (isConversationOver) return; // Don't advance if script is done
    advanceConversation();
    setInputText(''); // Clear input after advancing script
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  // Collapsed summary for user-selected attributes
  const renderUserAttrMsg = (attrs: { id: string; name: string }[]) => {
    if (!attrs.length) return null;
    const collapsed = attrs.slice(0, 3).map(a => a.name).join(', ');
    const more = attrs.length > 3 ? `, +${attrs.length - 3} more` : '';
    return `${collapsed}${more}`;
  };

  // If panel is not open, render nothing (or a button to open it, handled by AppHeader for now)
  if (!isRiaPanelOpen) {
    return null;
  }

  return (
    <aside className="flex flex-col w-full max-w-md min-w-[340px] bg-muted/30 border-l shadow-xl h-full">
      {/* Header: Sticky */}
      <div className="p-4 border-b bg-muted flex flex-row items-center justify-between h-[60px] shrink-0 sticky top-0 z-20">
        <h2 className="text-lg font-semibold text-foreground">RIA</h2>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsRiaPanelOpen(false)} 
          className="text-muted-foreground hover:text-foreground"
          aria-label="Close RIA Panel"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close RIA Panel</span>
        </Button>
      </div>

      {/* Scrollable chat area */}
      <div ref={scrollAreaRef} className="flex-grow overflow-y-auto bg-background p-4 space-y-4 min-h-0">
        {messages.map((msg) => (
          <RiaChatMessage key={msg.id} message={msg} />
        ))}
        {/* Show user attribute selection as a message */}
        {userAttrMsg && (
          <div className="flex justify-end mb-4">
            <div className="flex items-start gap-2.5 max-w-[85%] flex-row-reverse">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-muted text-foreground flex items-center justify-center font-semibold">U</div>
              <div className="p-3 rounded-lg shadow-sm w-full bg-card text-card-foreground rounded-tr-none border">
                <span className="text-sm">{userAttrMsg}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer/Input: Sticky */}
      <div className="p-3 border-t bg-muted shrink-0">
        <div className="flex items-end space-x-2">
          {/* Input with icons inside */}
          <div className="relative flex-grow">
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask anything..."
              className="flex-grow resize-none bg-card border-border focus-visible:ring-primary pr-28" // Add right padding for icons
              rows={1}
              onInput={(e) => { 
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto'; 
                target.style.height = `${Math.min(target.scrollHeight, 100)}px`; // Cap height at 100px
              }}
              style={{maxHeight: '100px', overflowY: 'auto'}}
            />
            {/* Icons inside the input field, right aligned and slightly smaller, closer to bottom/right */}
            <div className="absolute bottom-1.5 right-2 flex items-center gap-2 pointer-events-none">
              <span className="pointer-events-auto text-muted-foreground hover:text-primary transition-colors cursor-pointer p-0.5" title="Bold"><Bold className="h-5 w-5" /></span>
              <span className="pointer-events-auto text-muted-foreground hover:text-primary transition-colors cursor-pointer p-0.5" title="Plus"><Plus className="h-5 w-5" /></span>
              <span className="pointer-events-auto text-muted-foreground hover:text-primary transition-colors cursor-pointer p-0.5" title="Microphone"><Mic className="h-5 w-5" /></span>
            </div>
          </div>
          <Button 
            onClick={handleSendMessage} 
            disabled={isConversationOver}
            size="icon" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
            aria-label="Send Message"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send Message</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}
