import { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Loader2, Eye, Heart, Play, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Competitor } from '@/types';
import { toast } from 'sonner';
import { apiClient } from '@/services/api';
import { proxyAvatarUrl, proxyThumbnailUrl } from '@/utils/imageProxy';

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

interface CompetitorCardProps {
  competitor: Competitor;
  onRemove: (competitor: Competitor) => void;
  onViewDetails: (competitor: Competitor) => void;
}

function CompetitorCard({ competitor, onRemove, onViewDetails }: CompetitorCardProps) {
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const hasNewVideos = competitor.lastActivity &&
    new Date(competitor.lastActivity).getTime() > Date.now() - 24 * 60 * 60 * 1000;

  return (
    <Card
      className="group hover:shadow-lg hover:border-purple-600/50 transition-all duration-300 cursor-pointer relative overflow-hidden"
      onClick={() => onViewDetails(competitor)}
    >
      {hasNewVideos && (
        <div className="absolute top-2 right-2 z-10">
          <Badge className="bg-red-500 text-white text-xs animate-pulse">
            🔴 NEW
          </Badge>
        </div>
      )}

      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative flex-shrink-0">
            <img
              src={proxyAvatarUrl(competitor.avatar)}
              alt={competitor.username}
              className="h-14 w-14 rounded-full object-cover ring-2 ring-purple-600/20 group-hover:ring-purple-600/50 transition-all"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder-avatar.svg';
              }}
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-background border-2 border-background flex items-center justify-center">
              {competitor.platform === 'instagram' ? (
                <span className="text-base">📸</span>
              ) : (
                <svg className="w-3.5 h-3.5 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold truncate text-base">@{competitor.username}</p>
            {competitor.nickname && competitor.nickname !== competitor.username && (
              <p className="text-xs text-muted-foreground truncate">{competitor.nickname}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
          <div className="text-center p-2 bg-muted/50 rounded">
            <div className="font-bold text-sm">{formatNumber(competitor.followerCount)}</div>
            <div className="text-muted-foreground">Followers</div>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded">
            <div className="font-bold text-sm">{competitor.videoCount}</div>
            <div className="text-muted-foreground">Videos</div>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded">
            <div className="font-bold text-sm">{formatNumber(competitor.avgViews)}</div>
            <div className="text-muted-foreground">Avg Views</div>
          </div>
        </div>

        <div className="mb-3 p-2 bg-muted/30 rounded text-xs">
          {hasNewVideos ? (
            <div className="flex items-center gap-1 text-red-500 font-medium">
              <span>🆕</span>
              <span>New video {formatTimeAgo(competitor.lastActivity)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-muted-foreground">
              <span>✅</span>
              <span>Up to date • Last activity {formatTimeAgo(competitor.lastActivity)}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            className="flex-1 text-xs bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(competitor);
            }}
          >
            View Feed
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Remove @${competitor.username} from tracking?`)) {
                onRemove(competitor);
              }
            }}
          >
            Untrack
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function Competitors() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [searchPlatform, setSearchPlatform] = useState<'tiktok' | 'instagram'>('tiktok');
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [_showFilters, _setShowFilters] = useState(false);
  const [_filterPlatform, _setFilterPlatform] = useState<'all' | 'tiktok' | 'instagram'>('all');
  const [_filterSort, _setFilterSort] = useState<'recent' | 'followers' | 'engagement'>('recent');

  // Загрузить список competitors из API
  const loadCompetitors = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/competitors/');
      // Handle both paginated and array response
      const items = response.data.items || response.data;
      setCompetitors(items.map((c: any) => ({
        id: c.id.toString(),
        username: c.username,
        nickname: c.display_name,
        avatar: c.avatar_url || '/placeholder-avatar.svg',
        followerCount: c.followers_count,
        videoCount: c.total_videos,
        avgViews: c.avg_views,
        engagementRate: c.engagement_rate,
        topVideos: [],
        growthTrend: 'stable' as const,
        lastActivity: c.updated_at,
        platform: c.platform || 'tiktok', // Add platform field
      })));
    } catch (error) {
      console.error('Error loading competitors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Загрузить при монтировании
  useEffect(() => {
    loadCompetitors();
  }, []);

  // Извлечь username из URL или вернуть как есть
  const extractUsername = (input: string): string => {
    const trimmed = input.trim();

    // Если это TikTok URL, извлекаем username
    const tiktokMatch = trimmed.match(/tiktok\.com\/@([a-zA-Z0-9._]+)/);
    if (tiktokMatch) {
      return tiktokMatch[1];
    }

    // Если это Instagram URL, извлекаем username
    // Поддерживаем: instagram.com/username, instagram.com/username/, instagram.com/username/reels/
    const instagramMatch = trimmed.match(/instagram\.com\/([a-zA-Z0-9._]+)/);
    if (instagramMatch) {
      return instagramMatch[1];
    }

    // Убираем @ и слэши если есть
    return trimmed.replace('@', '').replace(/\/$/, '');
  };

  // Поиск канала
  const handleSearchChannel = async () => {
    if (!searchQuery.trim()) return;

    const cleanUsername = extractUsername(searchQuery);

    try {
      setIsSearching(true);
      setSearchResults(null);
      const response = await apiClient.get(`/competitors/search/${cleanUsername}?platform=${searchPlatform}`);
      setSearchResults(response.data);
    } catch (error: any) {
      console.error('Search error:', error);
      if (error.response?.status === 404) {
        toast.error(`@${cleanUsername} not found`);
      }
      setSearchResults(null);
    } finally {
      setIsSearching(false);
    }
  };

  // Добавить канал в список (с оптимизацией - передаем данные поиска)
  const handleAddChannel = async (channel: any) => {
    try {
      setIsAdding(true);
      // Передаем search_data чтобы избежать повторного запроса к Apify
      await apiClient.post('/competitors/', {
        username: channel.username,
        platform: channel.platform || searchPlatform,
        notes: '',
        search_data: {
          avatar: channel.avatar,
          follower_count: channel.follower_count,
          video_count: channel.video_count,
          nickname: channel.nickname || channel.username
        }
      });
      toast.success(`@${channel.username} added to your list`);
      setSearchQuery('');
      setSearchResults(null);
      loadCompetitors(); // Обновить список
    } catch (error: any) {
      console.error('Add error:', error);
      if (error.response?.status === 400) {
        toast.error(`@${channel.username} already in your list`);
      }
    } finally {
      setIsAdding(false);
    }
  };

  // Удалить канал
  const handleRemoveChannel = async (competitor: Competitor) => {
    try {
      await apiClient.delete(`/competitors/${competitor.username}`);
      toast.success(`@${competitor.username} removed`);
      loadCompetitors(); // Обновить список
    } catch (error) {
      console.error('Remove error:', error);
    }
  };

  const handleViewDetails = (competitor: Competitor) => {
    // Navigate to feed page
    window.location.href = `/dashboard/competitors/${competitor.username}/feed`;
  };

  const filteredCompetitors = competitors;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">Competitors</h1>
            <Badge variant="secondary" className="text-sm">
              {competitors.length} channels
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Search and track competitor channels
          </p>
        </div>
      </div>

      {/* Search Box */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Search className="h-5 w-5" />
          Search & Add Channels
        </h3>

        {/* Platform Selector */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={searchPlatform === 'tiktok' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSearchPlatform('tiktok')}
            className="gap-2"
          >
            🎵 TikTok
          </Button>
          <Button
            variant={searchPlatform === 'instagram' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSearchPlatform('instagram')}
            className="gap-2"
          >
            📸 Instagram
          </Button>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={`Enter ${searchPlatform === 'instagram' ? 'Instagram' : 'TikTok'} @username...`}
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchChannel()}
              disabled={isSearching}
            />
          </div>
          <Button
            onClick={handleSearchChannel}
            disabled={!searchQuery.trim() || isSearching}
          >
            {isSearching ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              'Search'
            )}
          </Button>
        </div>

        {/* Search Results */}
        {searchResults && (
          <div className="mt-4 border rounded-xl overflow-hidden bg-card">
            {/* Profile Header */}
            <div className="p-5">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <img
                    src={proxyAvatarUrl(searchResults.avatar)}
                    alt={searchResults.username}
                    className="h-16 w-16 rounded-full object-cover ring-2 ring-purple-500/30"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-avatar.svg';
                    }}
                  />
                  {/* Platform badge */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-background border-2 border-background flex items-center justify-center">
                    {searchResults.platform === 'instagram' ? (
                      <span className="text-sm">📸</span>
                    ) : (
                      <svg className="w-3.5 h-3.5 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                      </svg>
                    )}
                  </div>
                </div>

                {/* Name + Bio */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg truncate">{searchResults.nickname || searchResults.username}</h3>
                    {searchResults.verified && (
                      <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center bg-blue-500 text-white shrink-0">
                        ✓
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">@{searchResults.username}</p>
                  {searchResults.bio && (
                    <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">{searchResults.bio}</p>
                  )}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="text-center p-2.5 bg-muted/50 rounded-lg">
                  <div className="font-bold text-base">{formatNumber(searchResults.follower_count || 0)}</div>
                  <div className="text-xs text-muted-foreground">Followers</div>
                </div>
                <div className="text-center p-2.5 bg-muted/50 rounded-lg">
                  <div className="font-bold text-base">{formatNumber(searchResults.video_count || 0)}</div>
                  <div className="text-xs text-muted-foreground">Videos</div>
                </div>
                <div className="text-center p-2.5 bg-muted/50 rounded-lg">
                  <div className="font-bold text-base">{formatNumber(searchResults.following_count || 0)}</div>
                  <div className="text-xs text-muted-foreground">Following</div>
                </div>
              </div>
            </div>

            {/* Preview Videos — each as VideoCard style */}
            {searchResults.preview_videos && searchResults.preview_videos.length > 0 && (
              <div className="px-5 pb-4">
                <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">Recent Videos</p>
                <div className="grid grid-cols-5 gap-3">
                  {searchResults.preview_videos.map((video: any) => {
                    const isPlaying = playingVideoId === video.id;
                    return (
                    <Card
                      key={video.id}
                      className={cn(
                        'group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] cursor-pointer border-2',
                        'hover:border-purple-500/40 w-full'
                      )}
                      onClick={(e) => {
                        e.preventDefault();
                        if (!isPlaying && video.play_addr) {
                          setPlayingVideoId(video.id);
                        }
                      }}
                    >
                      {/* Thumbnail — aspect-[9/16] like VideoCard */}
                      <div className="relative aspect-[9/16] overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                        {isPlaying && video.play_addr ? (
                          /* HTML5 Video Player — same as VideoCard */
                          <video
                            src={video.play_addr}
                            className="w-full h-full object-cover"
                            controls
                            autoPlay
                            playsInline
                            onEnded={() => setPlayingVideoId(null)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : video.cover_url ? (
                          <img
                            src={proxyThumbnailUrl(video.cover_url)}
                            alt=""
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder-video.svg';
                            }}
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-500">
                            <Play className="h-12 w-12" />
                          </div>
                        )}

                        {/* Overlay — only show when not playing, same as VideoCard */}
                        {!isPlaying && (
                        <div className={cn(
                          'absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300',
                          'opacity-60 group-hover:opacity-100'
                        )}>
                          {/* Play Button center */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className={cn(
                              'rounded-full bg-white/90 flex items-center justify-center transition-all duration-300 shadow-lg',
                              'w-10 h-10 group-hover:w-12 group-hover:h-12 group-hover:scale-110'
                            )}>
                              <Play className="h-5 w-5 text-black fill-black ml-0.5 group-hover:h-6 group-hover:w-6" />
                            </div>
                          </div>

                          {/* Duration — bottom right */}
                          {video.duration > 0 && (
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                              {video.duration}s
                            </div>
                          )}

                          {/* Open in TikTok — top right on hover */}
                          {video.url && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-2 right-2 h-7 w-7 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(video.url, '_blank');
                              }}
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                        )}
                      </div>

                      {/* Content — same layout as VideoCard */}
                      <CardContent className="p-2 space-y-1.5">
                        {/* Author */}
                        <div className="flex items-center gap-1.5">
                          <img
                            src={proxyAvatarUrl(searchResults.avatar)}
                            alt={searchResults.username}
                            className="h-6 w-6 rounded-full object-cover ring-1 ring-purple-500/30"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder-avatar.svg';
                            }}
                          />
                          <span className="text-xs font-semibold truncate hover:text-purple-600 transition-colors">
                            @{searchResults.username}
                          </span>
                        </div>

                        {/* Stats — 2-col grid like VideoCard */}
                        <div className="pt-1 border-t">
                          <div className="grid grid-cols-2 gap-1 text-[11px]">
                            <div className="flex items-center gap-0.5 text-purple-600 dark:text-purple-400 font-medium">
                              <Eye className="h-3 w-3" />
                              <span>{formatNumber(video.views || 0)}</span>
                            </div>
                            <div className="flex items-center gap-0.5 text-pink-600 dark:text-pink-400 font-medium">
                              <Heart className="h-3 w-3" />
                              <span>{formatNumber(video.likes || 0)}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add Button */}
            <div className="px-5 pb-5">
              <Button
                onClick={() => handleAddChannel(searchResults)}
                disabled={isAdding}
                className="w-full h-11 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 font-semibold"
              >
                {isAdding ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding @{searchResults.username}...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add to Competitors
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* My Competitors Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">My Competitors</h2>
      </div>

      {/* Competitors Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      ) : filteredCompetitors.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No competitors yet</h3>
            <p className="text-muted-foreground mb-4">
              Search for channels above to add them to your list
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompetitors.map((competitor) => (
            <CompetitorCard
              key={competitor.id}
              competitor={competitor}
              onRemove={handleRemoveChannel}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
}
