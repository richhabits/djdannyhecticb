import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
// Security: Import rehype-sanitize to prevent XSS attacks from markdown content
import rehypeSanitize from "rehype-sanitize";

export function BlogPost() {
  const [match, params] = useRoute("/blog/:slug");

  const { data: post, isLoading } = useQuery({
    queryKey: ["blog:get", params?.slug],
    queryFn: () => trpc.blog.get.query({ slug: params?.slug || "" }),
    enabled: !!params?.slug,
  });

  if (!match) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="space-y-6">
            <div className="h-12 bg-slate-700 rounded animate-pulse" />
            <div className="h-40 bg-slate-700 rounded animate-pulse" />
            <div className="space-y-3">
              <div className="h-6 bg-slate-700 rounded animate-pulse" />
              <div className="h-6 bg-slate-700 rounded animate-pulse w-3/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Post Not Found</h1>
          <Link href="/blog">
            <a className="text-purple-400 hover:text-purple-300">Back to Blog</a>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <Link href="/blog">
          <a className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </a>
        </Link>

        {post.featuredImageUrl && (
          <div className="relative h-96 bg-slate-700 rounded-lg overflow-hidden">
            <img
              src={post.featuredImageUrl}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white">{post.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-slate-300">
            {post.author && <span>by {post.author}</span>}
            {post.publishedAt && (
              <span>
                {formatDistanceToNow(new Date(post.publishedAt), {
                  addSuffix: true,
                })}
              </span>
            )}
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-sm border-purple-500 text-purple-300"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="prose prose-invert max-w-none">
          <div className="text-slate-200 leading-relaxed space-y-4">
            <ReactMarkdown
              // Security: Enable rehypeSanitize to prevent XSS from user-provided markdown
              // This removes dangerous HTML tags and scripts from markdown content
              rehypePlugins={[rehypeSanitize]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-3xl font-bold text-white mt-8 mb-4">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-bold text-white mt-6 mb-3">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-bold text-slate-100 mt-4 mb-2">{children}</h3>
                ),
                p: ({ children }) => <p className="mb-4">{children}</p>,
                ul: ({ children }) => (
                  <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>
                ),
                li: ({ children }) => <li className="ml-2">{children}</li>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-purple-500 pl-4 italic mb-4">
                    {children}
                  </blockquote>
                ),
                code: ({ children }) => (
                  <code className="bg-slate-700 px-2 py-1 rounded text-sm font-mono">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="bg-slate-800 p-4 rounded mb-4 overflow-x-auto">
                    {children}
                  </pre>
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        </div>

        <div className="border-t border-slate-600 pt-8">
          <Link href="/blog">
            <a className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
