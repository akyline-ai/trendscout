import { useState } from 'react';
import { Sparkles, Copy, Download, Folder, Clock, Star, Trash2, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { AIScript } from '@/types';
import { DevAccessGate } from '@/components/DevAccessGate';

// Mock data for demonstration
const mockScripts: AIScript[] = [
  {
    id: '1',
    originalVideoId: 'video_1',
    hook: "Stop scrolling! Here's something that will change your perspective on productivity...",
    body: [
      "[Opening: Start with a shocking productivity stat]",
      "[Middle: Show the common mistake people make]",
      "[Climax: Reveal the simple trick that works]",
      "[Closing: Show the transformation results]",
    ],
    callToAction: "Try this for 7 days and let me know your results!",
    duration: 25,
    tone: 'engaging',
    niche: 'education',
    viralElements: ["Short duration", "Trending sound", "Eye-catching thumbnail"],
    tips: [
      "Use trending audio to boost reach",
      "Add text overlay for accessibility",
      "Post during peak hours",
    ],
    generatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: '2',
    originalVideoId: 'video_2',
    hook: "I tried the viral coffee hack for 30 days, and the results are insane!",
    body: [
      "[Opening: Show the before state]",
      "[Middle: Document the daily process]",
      "[Climax: Show the dramatic transformation]",
      "[Closing: Share honest thoughts and tips]",
    ],
    callToAction: "Save this video and try it yourself!",
    duration: 45,
    tone: 'casual',
    niche: 'lifestyle',
    viralElements: ["Transformation format", "Trending hack", "Personal story"],
    tips: [
      "Be authentic and honest",
      "Show real results",
      "Use before/after format",
    ],
    generatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: '3',
    originalVideoId: 'video_3',
    hook: "3 business mistakes that cost me $50,000 (so you don't have to)",
    body: [
      "[Opening: Hook with the loss amount]",
      "[Middle: Break down each mistake with examples]",
      "[Climax: Explain how to avoid them]",
      "[Closing: Offer actionable advice]",
    ],
    callToAction: "Follow for more business insights!",
    duration: 35,
    tone: 'professional',
    niche: 'business',
    viralElements: ["Shocking number in hook", "Value-driven content", "Expert positioning"],
    tips: [
      "Lead with a strong hook",
      "Provide concrete examples",
      "End with clear value",
    ],
    generatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
];

interface ScriptCardProps {
  script: AIScript;
  onSelect: (script: AIScript) => void;
  onDelete: (id: string) => void;
  onCopy: (script: AIScript) => void;
  onDownload: (script: AIScript) => void;
  isSelected: boolean;
}

function ScriptCard({ script, onSelect, onDelete, onCopy, onDownload, isSelected }: ScriptCardProps) {
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const timeAgo = (date: string): string => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const toneColors: Record<string, string> = {
    engaging: 'bg-purple-100 text-purple-700',
    professional: 'bg-blue-100 text-blue-700',
    casual: 'bg-green-100 text-green-700',
    humorous: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-300 hover:shadow-lg',
        isSelected && 'ring-2 ring-purple-500'
      )}
      onClick={() => onSelect(script)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base line-clamp-2 mb-2">
              {script.hook}
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={toneColors[script.tone] || 'bg-gray-100 text-gray-700'}>
                {script.tone}
              </Badge>
              <Badge variant="outline">{script.niche}</Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(script.duration)}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {timeAgo(script.generatedAt)}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onCopy(script);
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onDownload(script);
              }}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(script.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AIScripts() {
  const [scripts, setScripts] = useState<AIScript[]>(mockScripts);
  const [selectedScript, setSelectedScript] = useState<AIScript | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const handleCopy = (script: AIScript) => {
    const fullScript = `${script.hook}\n\n${script.body.join('\n')}\n\n${script.callToAction}`;
    navigator.clipboard.writeText(fullScript);
    setCopiedId(script.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (script: AIScript) => {
    const fullScript = `${script.hook}\n\n${script.body.join('\n')}\n\n${script.callToAction}`;
    const blob = new Blob([fullScript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-script-${script.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDelete = (id: string) => {
    setScripts(scripts.filter(s => s.id !== id));
    if (selectedScript?.id === id) {
      setSelectedScript(null);
    }
  };

  const filteredScripts = scripts.filter(script => {
    if (activeTab === 'all') return true;
    return script.niche === activeTab;
  });

  const niches = [
    { id: 'all', label: 'All Scripts', count: scripts.length },
    { id: 'entertainment', label: 'Entertainment', count: scripts.filter(s => s.niche === 'entertainment').length },
    { id: 'education', label: 'Education', count: scripts.filter(s => s.niche === 'education').length },
    { id: 'lifestyle', label: 'Lifestyle', count: scripts.filter(s => s.niche === 'lifestyle').length },
    { id: 'business', label: 'Business', count: scripts.filter(s => s.niche === 'business').length },
  ];

  return (
    <DevAccessGate>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-purple-500" />
            AI Scripts
          </h1>
          <p className="text-muted-foreground">
            Your generated viral scripts and content ideas
          </p>
        </div>
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          <Sparkles className="h-4 w-4 mr-2" />
          Generate New Script
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Folder className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">{scripts.length}</p>
              <p className="text-sm text-muted-foreground">Total Scripts</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
              <Star className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">12</p>
              <p className="text-sm text-muted-foreground">Favorites</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <FolderOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">8</p>
              <p className="text-sm text-muted-foreground">Used This Week</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">24</p>
              <p className="text-sm text-muted-foreground">Avg Duration (s)</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex-wrap h-auto">
          {niches.map((niche) => (
            <TabsTrigger key={niche.id} value={niche.id} className="flex-1 sm:flex-initial">
              {niche.label}
              <Badge variant="secondary" className="ml-2">
                {niche.count}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Script List */}
            <div className="lg:col-span-2 space-y-3 max-h-[600px] overflow-y-auto">
              {filteredScripts.length === 0 ? (
                <Card className="p-12">
                  <div className="text-center">
                    <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No scripts yet</h3>
                    <p className="text-muted-foreground">
                      Generate your first AI script from a trending video
                    </p>
                    <Button className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Script
                    </Button>
                  </div>
                </Card>
              ) : (
                filteredScripts.map((script) => (
                  <ScriptCard
                    key={script.id}
                    script={script}
                    onSelect={setSelectedScript}
                    onDelete={handleDelete}
                    onCopy={handleCopy}
                    onDownload={handleDownload}
                    isSelected={selectedScript?.id === script.id}
                  />
                ))
              )}
            </div>

            {/* Script Preview */}
            <div className="lg:col-span-1">
              {selectedScript ? (
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-500" />
                      Script Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Hook */}
                    <div>
                      <Badge variant="secondary" className="mb-2">
                        Hook (First 3 seconds)
                      </Badge>
                      <p className="font-medium text-lg">{selectedScript.hook}</p>
                    </div>

                    {/* Body */}
                    <div>
                      <Badge variant="secondary" className="mb-2">
                        Body
                      </Badge>
                      <div className="space-y-2">
                        {selectedScript.body.map((segment, index) => (
                          <p key={index} className="text-sm text-muted-foreground">
                            {segment}
                          </p>
                        ))}
                      </div>
                    </div>

                    {/* CTA */}
                    <div>
                      <Badge variant="secondary" className="mb-2">
                        Call to Action
                      </Badge>
                      <p className="font-medium">{selectedScript.callToAction}</p>
                    </div>

                    {/* Tips */}
                    <div>
                      <Badge variant="secondary" className="mb-2">
                        Pro Tips
                      </Badge>
                      <ul className="space-y-1">
                        {selectedScript.tips.map((tip, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                              {index + 1}
                            </span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4">
                      <Button
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        onClick={() => handleCopy(selectedScript)}
                      >
                        {copiedId === selectedScript.id ? (
                          <>
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDownload(selectedScript)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="sticky top-24 p-12">
                  <div className="text-center">
                    <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Select a script to view details
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </DevAccessGate>
  );
}
