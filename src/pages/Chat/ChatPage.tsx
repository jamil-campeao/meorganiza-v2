import React, { useState, useEffect, useRef } from "react";
import { SidebarProvider, SidebarInset } from "../../components/ui/sidebar";
import { SideBarMenu } from "../../components/SideBarMenu";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { useAuth } from "../../context/AuthContext";
import { Toaster, toast } from "sonner";
import { Bot, Send, User } from "lucide-react";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { API_BASE_URL } from "../../constants/api";

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

export function ChatPage() {
  const { token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'ai', text: 'Olá! Sou seu assistente financeiro. Como posso ajudar hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Efeito para rolar para a última mensagem
  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);


const handleSendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", `Bearer ${token}`);

        const raw = JSON.stringify({
            conversationId: conversationId, 
            question: currentInput,
        });

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
        };

        const response = await fetch(`${API_BASE_URL}/chat`, requestOptions);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "O assistente não conseguiu responder.");
        }

        const apiResponse = await response.json();
      
        // Salva o conversationId retornado pela API no estado do front-end
        if (apiResponse.conversationId) {
            setConversationId(apiResponse.conversationId);
        }

        const aiMessage: Message = { sender: 'ai', text: apiResponse.text || "Desculpe, não consegui processar sua solicitação." };
        setMessages((prevMessages) => [...prevMessages, aiMessage]);

    } catch (err: any) {
        toast.error(err.message);
        const errorMessage: Message = { sender: 'ai', text: `Ocorreu um erro: ${err.message}` };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
        setIsLoading(false);
    }
};

  return (
    <SidebarProvider>
      <SideBarMenu />
      <SidebarInset>
        <div className="min-h-screen bg-[#2F3748] text-[#E2E8F0] dark w-full">
          <div className="container mx-auto p-6 h-full flex flex-col">
            <h1 className="text-3xl font-bold mb-6">Assistente IA</h1>
            
            <Card className="border border-[#64748B] bg-[#3F4A5C] flex-1 flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot />
                  Assistente Financeiro
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-4">
                <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
                    <div className="space-y-6">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                        {msg.sender === 'ai' && (
                            <Avatar className="size-8">
                                <AvatarFallback className="bg-primary text-primary-foreground">IA</AvatarFallback>
                            </Avatar>
                        )}
                        <div className={`rounded-lg px-4 py-2 max-w-[80%] ${msg.sender === 'user' ? 'bg-[#8B3A3A] text-white' : 'bg-[#475569]'}`}>
                            <p className="text-sm">{msg.text}</p>
                        </div>
                        {msg.sender === 'user' && (
                             <Avatar className="size-8">
                                <AvatarFallback><User /></AvatarFallback>
                            </Avatar>
                        )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-3">
                             <Avatar className="size-8">
                                <AvatarFallback className="bg-primary text-primary-foreground">IA</AvatarFallback>
                            </Avatar>
                             <div className="rounded-lg px-4 py-2 bg-[#475569]">
                                <p className="text-sm">Pensando...</p>
                            </div>
                        </div>
                    )}
                    </div>
                </ScrollArea>
                <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-4 border-t border-[#64748B]">
                    <Input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Como posso te ajudar com suas finanças?"
                        className="flex-1"
                        disabled={isLoading}
                    />
                    <Button type="submit" size="icon" className="bg-[#8B3A3A] hover:bg-[#8B3A3A]/80" disabled={isLoading}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
        <Toaster theme="dark" />
      </SidebarInset>
    </SidebarProvider>
  );
}