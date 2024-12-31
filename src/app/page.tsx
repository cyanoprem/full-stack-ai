'use client';

import React from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import supabase from "@/lib/supabase";

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

  const handleButtonClick = async () => {
    if (!text.trim()) return;

    const { data, error } = await supabase
      .from("texts")
      .insert({ content: text, response: "" })
      .select();

    if (error) {
      console.log(error);
    } else {
      console.log(data);
      const openaiApiUrl = "https://api.openai.com/v1/chat/completions";
      const openaiApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

      const response = await fetch(openaiApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "developer",
              content: "You are a helpful assistant."
            },
            {
              role: "user",
              content: text
            }
          ],
          max_tokens: 2048,
          temperature: 0.7
        }),
      });

      const openaiResponse = await response.json();
      const openaiResponseText = openaiResponse.choices[0].message.content;

      if (data) {
        const { data: updatedData, error: updateError } = await supabase
          .from("texts")
          .update({ response: openaiResponseText })
          .eq("id", data[0].id)
          .select();

        if (updateError) {
          console.log(updateError);
        } else {
          console.log(updatedData);
        }
      }
      setText("");
      fetchData();
    }
  };

  const fetchData = async () => {
    const { data, error } = await supabase
      .from("texts")
      .select("*")
      .order('id', { ascending: true });

    if (error) {
      console.log(error);
    } else {
      setTexts(data);
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