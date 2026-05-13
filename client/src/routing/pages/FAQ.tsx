import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "../lib/trpc";
import { Input } from "../components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Search } from "lucide-react";
import ReactMarkdown from "react-markdown";

export function FAQ() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: faqs, isLoading } = useQuery({
    queryKey: ["faq:list"],
    queryFn: () => trpc.faq.list.query(),
  });

  const { data: searchResults } = useQuery({
    queryKey: ["faq:search", searchQuery],
    queryFn: () => trpc.faq.search.query({ query: searchQuery }),
    enabled: searchQuery.length > 0,
  });

  const displayFaqs = searchQuery ? searchResults : faqs;
  const categories = displayFaqs
    ? Object.keys(displayFaqs).filter(cat => Array.isArray(displayFaqs[cat]))
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white">Frequently Asked Questions</h1>
          <p className="text-lg text-slate-300">
            Find answers to common questions about bookings, merchandise, technical support, and more
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 py-2 w-full bg-slate-700 border-slate-600 text-white placeholder-slate-400"
          />
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-700 rounded animate-pulse" />
            ))}
          </div>
        ) : searchQuery ? (
          <Card className="bg-slate-700 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white">Search Results</CardTitle>
            </CardHeader>
            <CardContent>
              {searchResults && searchResults.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {searchResults.map(faq => (
                    <AccordionItem key={faq.id} value={`faq-${faq.id}`} className="border-slate-600">
                      <AccordionTrigger className="hover:text-purple-400 text-white">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-200">
                        <div className="prose prose-invert max-w-none">
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => <p className="mb-2">{children}</p>,
                              ul: ({ children }) => (
                                <ul className="list-disc list-inside space-y-1 mb-2">
                                  {children}
                                </ul>
                              ),
                              li: ({ children }) => <li className="ml-2">{children}</li>,
                              a: ({ children, href }) => (
                                <a href={href} className="text-purple-400 hover:text-purple-300">
                                  {children}
                                </a>
                              ),
                            }}
                          >
                            {faq.answer}
                          </ReactMarkdown>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-slate-300">No FAQs found matching your search</p>
              )}
            </CardContent>
          </Card>
        ) : categories.length > 0 ? (
          <Tabs defaultValue={categories[0]} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 bg-slate-700 border-slate-600">
              {categories.map(cat => (
                <TabsTrigger
                  key={cat}
                  value={cat}
                  className="capitalize text-slate-300 data-[state=active]:text-purple-400 data-[state=active]:bg-slate-600"
                >
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map(category => (
              <TabsContent key={category} value={category} className="mt-6">
                <Card className="bg-slate-700 border-slate-600">
                  <CardHeader>
                    <CardTitle className="text-white capitalize">{category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {displayFaqs[category]?.map(faq => (
                        <AccordionItem key={faq.id} value={`faq-${faq.id}`} className="border-slate-600">
                          <AccordionTrigger className="hover:text-purple-400 text-white">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-slate-200">
                            <div className="prose prose-invert max-w-none">
                              <ReactMarkdown
                                components={{
                                  p: ({ children }) => <p className="mb-2">{children}</p>,
                                  ul: ({ children }) => (
                                    <ul className="list-disc list-inside space-y-1 mb-2">
                                      {children}
                                    </ul>
                                  ),
                                  li: ({ children }) => <li className="ml-2">{children}</li>,
                                  a: ({ children, href }) => (
                                    <a href={href} className="text-purple-400 hover:text-purple-300">
                                      {children}
                                    </a>
                                  ),
                                }}
                              >
                                {faq.answer}
                              </ReactMarkdown>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-300 text-lg">No FAQs available yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
