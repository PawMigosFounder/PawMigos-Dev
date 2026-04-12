'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';

export default function CommunityPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);

  const fetchPosts = () => {
    api.get<any>('/api/community').then((res) => {
      if (res.success) setPosts(res.data?.posts || []);
      setLoading(false);
    });
  };

  useEffect(fetchPosts, []);

  const handlePost = async () => {
    if (!newPost.trim()) return;
    setPosting(true);
    const res = await api.post<any>('/api/community', { content: newPost });
    setPosting(false);
    if (res.success) {
      setNewPost('');
      fetchPosts();
    }
  };

  const handleLike = async (postId: string) => {
    await api.post(`/api/community/${postId}`, { action: 'like' });
    fetchPosts();
  };

  const handleComment = async (postId: string) => {
    const content = prompt('Your comment:');
    if (!content) return;
    await api.post(`/api/community/${postId}`, { content });
    fetchPosts();
  };

  return (
    <div className="px-4 py-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Community</h1>

      <Card className="mb-4">
        <CardContent>
          <textarea
            className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#F26F28] focus:border-transparent"
            rows={3}
            placeholder="Share something with the PawMigos community..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
          />
          <div className="flex justify-end mt-2">
            <Button size="sm" loading={posting} onClick={handlePost} disabled={!newPost.trim()}>
              Post
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-4">{[1,2,3].map((i) => <div key={i} className="bg-white rounded-2xl h-32 animate-pulse" />)}</div>
      ) : posts.length === 0 ? (
        <EmptyState title="No posts yet" description="Be the first to share something!" />
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardContent>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#F26F28]/10 flex items-center justify-center text-sm">
                    {post.user?.name?.[0] || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{post.user?.name || 'Anonymous'}</p>
                    <p className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{post.content}</p>
                {post.mediaUrl && (
                  <img src={post.mediaUrl} alt="" className="rounded-xl mt-2 max-h-64 w-full object-cover" />
                )}
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <button onClick={() => handleLike(post.id)} className="hover:text-[#F26F28] transition-colors">
                    ♥ {post.likes || 0}
                  </button>
                  <button onClick={() => handleComment(post.id)} className="hover:text-[#F26F28] transition-colors">
                    💬 {post._count?.comments || 0}
                  </button>
                </div>
                {post.comments?.length > 0 && (
                  <div className="mt-2 space-y-1 border-t pt-2">
                    {post.comments.map((c: any) => (
                      <p key={c.id} className="text-xs text-gray-600">
                        <span className="font-medium">Comment:</span> {c.content}
                      </p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
