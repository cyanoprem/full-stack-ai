// /src/app/page.tsx
'use client';

import React from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface DataType {
  id: number;
  content: string;
  response: string;
}

export default function Home() {
  const [text, setText] = React.useState("");
  const [texts, setTexts] = React.useState<DataType[]>([]);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [texts]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
  };

  const fetchData = async () => {
    try {
      const response = await fetch('/api/messages');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const { data } = await response.json();
      if (data) {
        setTexts(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };
  
  const handleButtonClick = async () => {
    if (!text.trim()) return;
  
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: text }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      setText("");
      await fetchData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleButtonClick();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {texts.map((item) => (
          <div key={item.id} className="space-y-2">
            <div className="flex justify-end">
              <div className="bg-blue-500 text-white rounded-lg py-2 px-4 max-w-md">
                {item.content}
              </div>
            </div>
            {item.response && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 rounded-lg py-2 px-4 max-w-md shadow-sm">
                  {item.response}
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t bg-white p-4">
        <div className="max-w-4xl mx-auto flex gap-2">
          <Input
            type="text"
            value={text}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button 
            onClick={handleButtonClick}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}