"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { Badge } from '@/components/atoms/Badge';
import { cn } from '@/lib/utils';
import { X, Check, Search, Tag as TagIcon, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/atoms/Dialog';
import Link from 'next/link';

interface TagPickerProps {
  selectedTagNames: string[];
  onChange: (tags: string[]) => void;
  className?: string;
}

export const TagPicker: React.FC<TagPickerProps> = ({ selectedTagNames, onChange, className }) => {
  const { tags } = useFinanceStore();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [direction, setDirection] = useState<'down' | 'up'>('down');
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const calculateDirection = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // Dropdown height estimation + padding (~300px)
      if (spaceBelow < 300) {
        setDirection('up');
      } else {
        setDirection('down');
      }
    }
  };

  const sortedAndFilteredTags = useMemo(() => {
    let result = tags.filter(tag => tag.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Sort selected ones to top
    return result.sort((a, b) => {
      const aSelected = selectedTagNames.includes(a.name);
      const bSelected = selectedTagNames.includes(b.name);
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return 0;
    });
  }, [tags, searchTerm, selectedTagNames]);

  const toggleTag = (tagName: string) => {
    if (selectedTagNames.includes(tagName)) {
      onChange(selectedTagNames.filter(t => t !== tagName));
    } else {
      onChange([...selectedTagNames, tagName]);
    }
  };

  const handleOpen = () => {
     if (!isMobile) calculateDirection();
     setIsOpen(true);
  };

  // Render lists of tags
  const renderTagList = (inDialog: boolean = false) => {
    if (sortedAndFilteredTags.length === 0) {
      return (
        <div className="p-8 text-center space-y-3">
          <p className="text-xs text-muted-foreground font-medium">Etiket bulunamadı.</p>
          <Link href="/settings/tags" onClick={() => setIsOpen(false)} className="text-[10px] text-primary bg-primary/10 px-3 py-1.5 rounded-full inline-block uppercase tracking-widest font-bold hover:bg-primary/20 transition-colors">
            YENİ ETİKET EKLE
          </Link>
        </div>
      );
    }

    return (
      <div className={cn(
        "grid gap-2", 
        inDialog ? "grid-cols-2" : "grid-cols-2"
      )}>
        {sortedAndFilteredTags.map(tag => {
          const isSelected = selectedTagNames.includes(tag.name);
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => {
                toggleTag(tag.name);
                if (!inDialog) setSearchTerm('');
              }}
              className={cn(
                "flex items-center justify-between p-3 rounded-2xl border transition-all text-left flex-1 min-w-0 border-white/5",
                isSelected ? "border-primary/50 shadow-sm bg-primary/10" : "hover:border-primary/20",
                !isSelected && tag.color ? tag.color : ""
              )}
              style={isSelected && tag.color ? { borderLeftColor: 'currentColor', borderLeftWidth: '4px' } : {}}
            >
              <span className={cn("text-[11px] font-black uppercase tracking-widest truncate", isSelected ? "text-primary" : "")}>#{tag.name}</span>
              {isSelected ? (
                <div className="p-1 rounded-full bg-primary/20 text-primary shrink-0 ml-1">
                   <Check className="w-3 h-3" />
                </div>
              ) : (
                <Plus className="w-3 h-3 opacity-30 shrink-0 ml-1" />
              )}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className={cn("space-y-3", className)} ref={containerRef}>
      {/* Selected Tags Display (outside view) */}
      <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-muted/20 rounded-2xl border border-white/5 transition-all">
        {selectedTagNames.map(tagName => {
          const tagInfo = tags.find(t => t.name === tagName);
          return (
            <Badge 
              key={tagName} 
              className={cn(
                "gap-1 pl-2.5 pr-1 py-1 rounded-xl border animate-in zoom-in-95 duration-200",
                tagInfo?.color || "bg-primary/10 text-primary border-primary/20"
              )}
            >
              <span className="text-[10px] font-black uppercase tracking-widest">{tagName}</span>
              <button 
                type="button" 
                onClick={() => toggleTag(tagName)}
                className="hover:bg-black/10 rounded-full p-0.5 transition-colors"
                title="Kaldır"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          );
        })}
        {selectedTagNames.length === 0 && (
          <span className="text-[10px] text-muted-foreground italic mt-1.5 ml-1 opacity-50">Henüz etiket seçilmedi...</span>
        )}
      </div>

      {/* TagPicker Invoker / Search Input */}
      {isMobile ? (
         // Mobile triggers Dialog
         <>
           <button 
             type="button"
             onClick={() => setIsOpen(true)}
             className="w-full bg-background/50 border border-white/10 rounded-xl h-10 px-4 flex items-center justify-between transition-all hover:bg-white/5"
           >
             <span className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                <TagIcon className="w-4 h-4" /> Etiket Seç / Ara...
             </span>
             {selectedTagNames.length > 0 && (
                <span className="text-[10px] font-black uppercase tracking-widest bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                  {selectedTagNames.length} Seçili
                </span>
             )}
           </button>

           <Dialog open={isOpen} onOpenChange={setIsOpen}>
             <DialogContent className="sm:hidden w-[100vw] h-[100dvh] flex flex-col p-6 rounded-none m-0 border-none bg-card/95 backdrop-blur-3xl overflow-hidden [&>button]:top-6 [&>button]:right-6">
                <DialogHeader className="shrink-0 mb-6 text-left">
                  <DialogTitle className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 text-primary rounded-xl shadow-inner">
                           <TagIcon className="w-5 h-5" />
                        </div>
                        <span className="text-xl font-black tracking-tight">Etiketler</span>
                     </div>
                  </DialogTitle>
                </DialogHeader>

                <div className="relative mb-4 shrink-0">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="text"
                    placeholder="Etiket ara..."
                    className="w-full bg-background/80 border border-white/10 rounded-2xl h-12 pl-11 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all shadow-inner"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {selectedTagNames.length > 0 && (
                   <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 shrink-0">
                     {selectedTagNames.length} Etiket Seçildi
                   </div>
                )}

                <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-2 pr-2 scrollbar-none pb-24">
                   {renderTagList(true)}
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent border-t border-white/5 pt-12">
                   <button 
                     onClick={() => setIsOpen(false)}
                     className="w-full h-14 bg-primary text-primary-foreground font-black tracking-widest uppercase rounded-2xl shadow-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                   >
                     <Check className="w-5 h-5" /> UYGULA
                   </button>
                </div>
             </DialogContent>
           </Dialog>
         </>
      ) : (
         // Desktop Dropdown
         <div className="relative">
            <div className="flex items-center gap-2">
               <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input 
                    type="text"
                    placeholder="Etiket ara..."
                    className="w-full bg-background/50 border border-white/10 rounded-xl h-10 pl-9 pr-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={handleOpen}
                  />
               </div>
               <button 
                 type="button"
                 onClick={() => isOpen ? setIsOpen(false) : handleOpen()}
                 className={cn(
                   "h-10 px-3 rounded-xl border border-white/10 flex items-center gap-2 transition-all hover:bg-white/5",
                   isOpen ? "bg-primary/10 border-primary/20 text-primary" : "bg-background/50"
                 )}
               >
                 <TagIcon className="w-4 h-4" />
                 <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Seç</span>
               </button>
            </div>

            {isOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsOpen(false)} 
                />
                <div className={cn(
                  "absolute left-0 right-0 z-50 p-3 bg-card/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl animate-in fade-in duration-200 max-h-[300px] overflow-y-auto custom-scrollbar",
                  direction === 'up' ? "bottom-full mb-2 slide-in-from-bottom-2" : "top-full mt-2 slide-in-from-top-2"
                )}>
                  {renderTagList(false)}
                </div>
              </>
            )}
         </div>
      )}
    </div>
  );
};
