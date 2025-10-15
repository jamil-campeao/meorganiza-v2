import React, { useState, useEffect, useRef, FormEvent } from "react";
import { SidebarProvider, SidebarInset } from "../../components/ui/sidebar";
import { SideBarMenu } from "../../components/SideBarMenu";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { useAuth } from "../../context/AuthContext";
import { Toaster, toast } from "sonner";
import { Bot, Send, User, Loader2, XCircle } from "lucide-react";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { API_BASE_URL } from "../../constants/api";

interface Message {
  sender: 'USER' | 'AI';
  text: string;
}

const initialMessage: Message = { sender: 'AI', text: 'Olá! Sou seu assistente financeiro. Como posso ajudar hoje?' };

export function ChatPage() {
  const { token, logout } = useAuth();
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Efeito para buscar uma conversa ativa ao carregar a página
  useEffect(() => {
    const loadActiveConversation = async () => {
      if (!token) return;
      try {
        const myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${token}`);
        const requestOptions = { method: "GET", headers: myHeaders };

        const response = await fetch(`${API_BASE_URL}/chat/`, requestOptions);

        // Se não encontrar uma conversa ativa (404), não é um erro, apenas começa uma nova.
        if (response.status === 404) {
          setConversationId(null);
          setMessages([initialMessage]);
          return;
        }
        if (!response.ok) {
          throw new Error("Não foi possível carregar o histórico do chat.");
        }

        const data = await response.json();

        if (data) {
          console.log('entrei aqui depois')
          const data_primeira = data[0];
        
        if (data_primeira.messages && data_primeira.messages.length > 0) {
          setMessages(data_primeira.messages);
          setConversationId(data_primeira.id);
        }
      }

      } catch (err: any) {
        toast.error(err.message);
      }
    };

    loadActiveConversation();
  }, [token]);

  // Efeito para rolar para a última mensagem
  useEffect(() => {
    const scrollViewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
    if (scrollViewport) {
      setTimeout(() => {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }, 100);
    }
  }, [messages, isLoading]);


  const handleFinishSession = async () => {
    if (!conversationId || !token) {
        // Se não há conversa, apenas reseta o estado local
        setMessages([initialMessage]);
        setConversationId(null);
        toast.info("Nenhuma conversa ativa para finalizar.");
        return;
    };
    
    try {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", `Bearer ${token}`);
        const requestOptions = {
            method: "PATCH",
            headers: myHeaders,
            body: JSON.stringify({ conversationId })
        };

        const response = await fetch(`${API_BASE_URL}/chat`, requestOptions);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "Não foi possível finalizar a conversa.");
        }
        
        toast.success("Conversa finalizada. Você pode começar uma nova.");
        setMessages([initialMessage]);
        setConversationId(null);

    } catch (err: any) {
        toast.error(err.message);
    }
  };


  const handleSendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { sender: 'USER', text: input };
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

        if (response.status === 401) {
            logout();
            return;
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "O assistente não conseguiu responder.");
        }

        const apiResponse = await response.json();
      
        if (apiResponse.conversationId && !conversationId) {
            setConversationId(apiResponse.conversationId);
        }

        const aiMessage: Message = { sender: 'AI', text: apiResponse.text || "Desculpe, não consegui processar sua solicitação." };
        setMessages((prevMessages) => [...prevMessages, aiMessage]);

    } catch (err: any) {
        toast.error(err.message);
        const errorMessage: Message = { sender: 'AI', text: `Ocorreu um erro: ${err.message}` };
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
          <div className="container mx-auto p-6 h-screen flex flex-col">
            <h1 className="text-3xl font-bold mb-6">Assistente IA</h1>
            
            <Card className="border border-[#64748B] bg-[#3F4A5C] flex-1 flex flex-col overflow-hidden">
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Bot />
                  Assistente Financeiro
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={handleFinishSession}>
                    <XCircle className="mr-2 h-4 w-4"/>
                    Finalizar Conversa
                </Button>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
                <ScrollArea className="flex-1 pr-4 -mr-4" ref={scrollAreaRef}>
                    <div className="space-y-6 pb-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 ${msg.sender === 'USER' ? 'justify-end' : ''}`}>
                        {msg.sender === 'AI' && (
                            <Avatar className="size-8">
                                <AvatarFallback className="bg-[#8B3A3A] text-primary-foreground">IA</AvatarFallback>
                            </Avatar>
                        )}
                        <div className={`rounded-lg px-4 py-2 max-w-[80%] break-words ${msg.sender === 'USER' ? 'bg-[#8B3A3A] text-white' : 'bg-[#475569]'}`}>
                            <p className="text-sm">{msg.text}</p>
                        </div>
                        {msg.sender === 'USER' && (
                             <Avatar className="size-8">
                                <AvatarFallback><User /></AvatarFallback>
                            </Avatar>
                        )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-3">
                             <Avatar className="size-8">
                                <AvatarFallback className="bg-[#8B3A3A] text-primary-foreground">IA</AvatarFallback>
                            </Avatar>
                             <div className="rounded-lg px-4 py-2 bg-[#475569] flex items-center">
                                <Loader2 className="h-4 w-4 animate-spin" />
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