import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Calendar as CalendarIcon, 
  BarChart3, 
  Plus,
  Clock,
  CheckCircle2,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  TrendingUp,
  Loader2
} from "lucide-react";
import { useLinkedInPosts } from "@/hooks/useApi";
import { apiService } from "@/lib/api";
import { useState } from "react";

const PostCard = ({ post, onUpdate }: { post: any; onUpdate: () => void }) => {
  const [approving, setApproving] = useState(false);

  const getStatusColor = (status: string) => {
    const colors = {
      DRAFT: 'bg-muted text-muted-foreground',
      PENDING_APPROVAL: 'bg-warning text-warning-foreground',
      APPROVED: 'bg-success text-success-foreground',
      SCHEDULED: 'bg-primary text-primary-foreground',
      PUBLISHED: 'bg-accent text-accent-foreground',
      REJECTED: 'bg-destructive text-destructive-foreground'
    };
    return colors[status as keyof typeof colors] || colors.DRAFT;
  };

  const getStatusText = (status: string) => {
    const texts = {
      DRAFT: 'Entwurf',
      PENDING_APPROVAL: 'Wartet auf Freigabe',
      APPROVED: 'Freigegeben',
      SCHEDULED: 'Geplant',
      PUBLISHED: 'Veröffentlicht',
      REJECTED: 'Abgelehnt'
    };
    return texts[status as keyof typeof texts] || 'Unbekannt';
  };

  const handleApprove = async () => {
    setApproving(true);
    try {
      await apiService.approveLinkedInPost(post.id);
      onUpdate();
    } catch (error) {
      console.error('Failed to approve post:', error);
    } finally {
      setApproving(false);
    }
  };

  return (
    <Card className="hover:shadow-medium transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-tight line-clamp-2">
            {post.content.split('\n')[0] || 'Unbenannter Post'}
          </CardTitle>
          <Badge className={`text-xs ${getStatusColor(post.status)}`}>
            {getStatusText(post.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground line-clamp-3">
          {post.content}
        </div>
        
        {post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.hashtags.slice(0, 3).map((hashtag: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                #{hashtag}
              </Badge>
            ))}
            {post.hashtags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{post.hashtags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="space-y-2">
          {post.scheduledDate && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarIcon className="h-3 w-3" />
              Geplant für: {post.scheduledDate.toLocaleDateString('de-DE', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          )}
          
          {post.publishedAt && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3 w-3" />
              Veröffentlicht: {post.publishedAt.toLocaleDateString('de-DE')}
            </div>
          )}
        </div>

        {post.analytics && (
          <div className="grid grid-cols-2 gap-3 p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 text-xs">
              <Eye className="h-3 w-3 text-muted-foreground" />
              <span>{post.analytics.views.toLocaleString()} Views</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Heart className="h-3 w-3 text-muted-foreground" />
              <span>{post.analytics.likes} Likes</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <MessageSquare className="h-3 w-3 text-muted-foreground" />
              <span>{post.analytics.comments} Kommentare</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Share2 className="h-3 w-3 text-muted-foreground" />
              <span>{post.analytics.shares} Shares</span>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1">
            Bearbeiten
          </Button>
          {post.status === 'PENDING_APPROVAL' ? (
            <Button 
              size="sm" 
              className="flex-1"
              onClick={handleApprove}
              disabled={approving}
            >
              {approving ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Freigeben'}
            </Button>
          ) : (
            <Button size="sm" className="flex-1">
              Details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const CreatePostDialog = ({ onPostCreated }: { onPostCreated: () => void }) => {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    content: '',
    hashtags: '',
    scheduledDate: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    
    try {
      const postData = {
        content: formData.content,
        hashtags: formData.hashtags ? formData.hashtags.split(',').map(tag => tag.trim()) : [],
        scheduledDate: formData.scheduledDate ? new Date(formData.scheduledDate).toISOString() : undefined
      };

      const response = await apiService.createLinkedInPost(postData);
      if (response.success) {
        setOpen(false);
        setFormData({ content: '', hashtags: '', scheduledDate: '' });
        onPostCreated();
      }
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Neuen Post erstellen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Neuen LinkedIn-Post erstellen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Content</label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={6}
              placeholder="Schreiben Sie hier Ihren LinkedIn-Post..."
              required
            />
            <div className="text-xs text-muted-foreground mt-1">
              {formData.content.length}/3000 Zeichen
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Hashtags (kommagetrennt)</label>
            <Input
              value={formData.hashtags}
              onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
              placeholder="München, Immobilien, Villa, Luxus"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Zeitplan (optional)</label>
            <Input
              type="datetime-local"
              value={formData.scheduledDate}
              onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Erstellen'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const CalendarView = ({ posts }: { posts: any[] }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  const scheduledPosts = posts?.filter(post => 
    post.scheduledDate && new Date(post.scheduledDate) > new Date()
  ) || [];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Post-Kalender</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Geplante Posts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {scheduledPosts.map((post, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium line-clamp-1">
                  {post.content.split('\n')[0]}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {post.scheduledDate?.toLocaleDateString('de-DE', {
                    weekday: 'long',
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

const AnalyticsView = ({ posts }: { posts: any[] }) => {
  const publishedPosts = posts?.filter(post => post.analytics) || [];
  const totalViews = publishedPosts.reduce((sum, post) => sum + (post.analytics?.views || 0), 0);
  const totalEngagement = publishedPosts.reduce((sum, post) => 
    sum + (post.analytics?.likes || 0) + (post.analytics?.comments || 0) + (post.analytics?.shares || 0), 0
  );
  const avgEngagementRate = publishedPosts.length > 0 ? 
    publishedPosts.reduce((sum, post) => sum + (post.analytics?.engagement || 0), 0) / publishedPosts.length : 0;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Gesamt-Reichweite</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-xs text-success">
              <TrendingUp className="h-3 w-3" />
              +15.3% vs. letzter Monat
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Gesamt-Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEngagement.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-xs text-success">
              <TrendingUp className="h-3 w-3" />
              +8.7% vs. letzter Monat
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Engagement Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgEngagementRate.toFixed(1)}%</div>
            <Progress value={avgEngagementRate} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Post Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Post Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {publishedPosts.map((post, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium line-clamp-1">{post.content.split('\n')[0]}</h4>
                  <Badge variant="outline" className="text-xs">
                    {post.analytics?.engagement.toFixed(1)}% ER
                  </Badge>
                </div>
                
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Views</div>
                    <div className="font-medium">{post.analytics?.views.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Likes</div>
                    <div className="font-medium">{post.analytics?.likes}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Kommentare</div>
                    <div className="font-medium">{post.analytics?.comments}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Shares</div>
                    <div className="font-medium">{post.analytics?.shares}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function LinkedInPage() {
  const { data: posts, loading, error, refetch } = useLinkedInPosts();

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">LinkedIn Post-Planer</h1>
            <p className="text-muted-foreground">
              Content-Erstellung, Planungs-Kalender und Performance-Analytics
            </p>
          </div>
          <CreatePostDialog onPostCreated={refetch} />
        </div>

        <Tabs defaultValue="editor" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="editor" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Post-Editor
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Kalender
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Lade Posts...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-destructive mb-4">Fehler beim Laden der Posts: {error}</p>
                <Button onClick={refetch}>Erneut versuchen</Button>
              </div>
            ) : posts && posts.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} onUpdate={refetch} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Keine Posts vorhanden</p>
                <CreatePostDialog onPostCreated={refetch} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <CalendarView posts={posts || []} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsView posts={posts || []} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}