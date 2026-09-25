import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Terminal, 
  X, 
  Search, 
  ArrowLeft, 
  ChevronRight, 
  CornerDownLeft, 
  Sparkles, 
  Layers, 
  Wallet, 
  BadgePercent, 
  Award, 
  Calculator,
  Check
} from 'lucide-react';
import { TerminalNode } from './terminalTypes';
import { CBS_TERMINAL_TREE } from './terminalData';
import { TerminalActionForm } from './TerminalActionForm';
import { useLanguageStore } from '../../../store/useLanguageStore';

interface FastBankingTerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FastBankingTerminalModal: React.FC<FastBankingTerminalModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useLanguageStore();
  const [navPath, setNavPath] = useState<TerminalNode[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Current active node or root
  const currentNode = navPath.length > 0 ? navPath[navPath.length - 1] : null;

  // Active list of nodes to display
  const activeChildren = useMemo(() => {
    if (currentNode) {
      return currentNode.children || [];
    }
    return CBS_TERMINAL_TREE;
  }, [currentNode]);

  // Flattened search for global query
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;

    const results: { node: TerminalNode; path: TerminalNode[] }[] = [];

    const traverse = (nodes: TerminalNode[], currentTrail: TerminalNode[]) => {
      for (const n of nodes) {
        const match =
          n.labelNe.toLowerCase().includes(q) ||
          n.labelEn.toLowerCase().includes(q) ||
          (n.descriptionNe && n.descriptionNe.toLowerCase().includes(q)) ||
          (n.badge && n.badge.toLowerCase().includes(q));

        if (match && n.operation) {
          results.push({ node: n, path: [...currentTrail, n] });
        }
        if (n.children) {
          traverse(n.children, [...currentTrail, n]);
        }
      }
    };

    traverse(CBS_TERMINAL_TREE, []);
    return results;
  }, [searchQuery]);

  // Reset selected index when navigating or searching
  useEffect(() => {
    setSelectedIndex(0);
  }, [navPath, searchQuery]);

  // Global keydown handler inside the modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // If currently on an operation leaf node, TerminalActionForm manages its own typing
      if (currentNode?.operation) {
        return;
      }

      // Check if user is typing in the search box
      const isSearchFocused = document.activeElement === searchInputRef.current;

      // Escape key behavior
      if (e.key === 'Escape') {
        e.preventDefault();
        if (searchQuery) {
          setSearchQuery('');
        } else if (navPath.length > 0) {
          setNavPath((prev) => prev.slice(0, prev.length - 1));
        } else {
          onClose();
        }
        return;
      }

      // Backspace ascends if search is empty and not typing inside search
      if (e.key === 'Backspace' && !isSearchFocused && navPath.length > 0) {
        e.preventDefault();
        setNavPath((prev) => prev.slice(0, prev.length - 1));
        return;
      }

      // If search results are showing:
      if (searchResults) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % searchResults.length);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          const target = searchResults[selectedIndex];
          if (target) {
            setNavPath(target.path);
            setSearchQuery('');
          }
        }
        return;
      }

      // Arrow navigation in standard menu list
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (activeChildren.length || 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + activeChildren.length) % (activeChildren.length || 1));
        return;
      }

      // Enter key: drill down into selected index
      if (e.key === 'Enter' && !isSearchFocused) {
        e.preventDefault();
        const selected = activeChildren[selectedIndex];
        if (selected) {
          setNavPath((prev) => [...prev, selected]);
        }
        return;
      }

      // Number keys 1-9 to jump directly into menu item
      if (!isSearchFocused && /^[1-9]$/.test(e.key)) {
        const code = e.key;
        const matched = activeChildren.find((c) => c.code === code);
        if (matched) {
          e.preventDefault();
          setNavPath((prev) => [...prev, matched]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, navPath, currentNode, activeChildren, selectedIndex, searchResults, searchQuery, onClose]);

  if (!isOpen) return null;

  // Icon helper
  const renderIcon = (name?: string) => {
    switch (name) {
      case 'Wallet':
        return <Wallet className="size-5 text-blue-400" />;
      case 'BadgePercent':
        return <BadgePercent className="size-5 text-emerald-400" />;
      case 'Award':
        return <Award className="size-5 text-amber-400" />;
      case 'Calculator':
        return <Calculator className="size-5 text-purple-400" />;
      default:
        return <Layers className="size-5 text-slate-400" />;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="fast-terminal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Terminal Header */}
        <div className="px-5 py-3.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-blue-600/30 border border-blue-500/40 text-blue-400 flex items-center justify-center font-mono font-bold shadow-xs">
              <Terminal className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="fast-terminal-title" className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-2">
                  <span>द्रुत बैंकिङ कन्सोल (CBS Fast Terminal)</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-900/60 text-blue-300 border border-blue-700/60">
                    F2
                  </span>
                </h2>
              </div>
              <p className="text-[11px] text-slate-400">
                {t('माउस बिना सम्पूर्ण बैंकिङ कारोबार प्रविष्टि किबोर्डबाट मात्र', 'High-speed keyboard-driven banking without mouse movement')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick helper badges */}
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <kbd className="px-1 bg-slate-800 border border-slate-700 rounded text-slate-300">1-9</kbd>
                छनोट
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 bg-slate-800 border border-slate-700 rounded text-slate-300">Enter</kbd>
                प्रवेश
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 bg-slate-800 border border-slate-700 rounded text-slate-300">Esc</kbd>
                फिर्ता
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Breadcrumb Bar */}
        <div className="px-5 py-2.5 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-400 overflow-x-auto custom-scrollbar">
            <button
              type="button"
              onClick={() => setNavPath([])}
              className={`hover:text-blue-400 transition cursor-pointer ${
                navPath.length === 0 ? 'text-blue-400 font-bold' : ''
              }`}
            >
              ROOT [F2]
            </button>
            {navPath.map((node, index) => (
              <React.Fragment key={node.id}>
                <ChevronRight className="size-3 text-slate-600 shrink-0" />
                <button
                  type="button"
                  onClick={() => setNavPath((prev) => prev.slice(0, index + 1))}
                  className={`hover:text-blue-400 transition whitespace-nowrap cursor-pointer ${
                    index === navPath.length - 1 ? 'text-blue-300 font-bold' : ''
                  }`}
                >
                  [{node.code}] {node.labelNe}
                </button>
              </React.Fragment>
            ))}
          </div>

          {navPath.length > 0 && !currentNode?.operation && (
            <button
              type="button"
              onClick={() => setNavPath((prev) => prev.slice(0, prev.length - 1))}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white shrink-0 ml-3 cursor-pointer"
            >
              <ArrowLeft className="size-3" />
              <span>माथि जानुहोस् (Bksp)</span>
            </button>
          )}
        </div>

        {/* Live Search Bar (visible when not in leaf action form) */}
        {!currentNode?.operation && (
          <div className="px-5 py-3 bg-slate-950/40 border-b border-slate-800/60">
            <div className="relative">
              <Search className="size-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="योजना वा कार्य सिधै खोज्नुहोस् (उदा. जम्मा, ऋण, EMI, मुद्दती, महिला)..."
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-white"
                >
                  हटाउनुहोस् (Esc)
                </button>
              )}
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
          {/* If leaf operation: render TerminalActionForm */}
          {currentNode?.operation ? (
            <TerminalActionForm
              node={currentNode}
              breadcrumbs={navPath}
              onBack={() => setNavPath((prev) => prev.slice(0, prev.length - 1))}
            />
          ) : searchResults ? (
            /* Search Results Mode */
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>खोज परिणाम: {searchResults.length} वटा कार्यहरू फेला परे</span>
                <span className="text-[10px]">चयन गर्न Enter थिच्नुहोस्</span>
              </div>
              {searchResults.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  कुनै पनि कार्य वा योजना फेला परेन। कृपया फरक शब्द खोज्नुहोस्।
                </div>
              ) : (
                searchResults.map((res, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={res.node.id}
                      onClick={() => {
                        setNavPath(res.path);
                        setSearchQuery('');
                      }}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500/80 shadow-md text-white'
                          : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/80 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`size-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-white">{res.node.labelNe}</span>
                            <span className="text-[11px] text-slate-400 font-mono">({res.node.labelEn})</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                            {res.path.map((p) => p.labelNe).join(' > ')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isSelected && (
                          <span className="flex items-center gap-1 text-[10px] font-mono text-blue-400">
                            <CornerDownLeft className="size-3" /> Enter
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* Standard Tree Menu Mode */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeChildren.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                const isLeaf = Boolean(item.operation);

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setNavPath((prev) => [...prev, item]);
                    }}
                    className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-gradient-to-br from-blue-900/40 to-slate-800/80 border-blue-500 shadow-lg ring-1 ring-blue-500/50'
                        : 'bg-slate-800/50 border-slate-700/70 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        {/* Hotkey Badge [1], [2], etc. */}
                        <div
                          className={`size-8 rounded-lg flex items-center justify-center font-mono font-bold text-sm shrink-0 shadow-sm ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-blue-500/30'
                              : 'bg-slate-900 border border-slate-700 text-blue-400'
                          }`}
                        >
                          {item.code}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                              {item.labelNe}
                            </h4>
                            {item.badge && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {item.labelEn}
                          </p>
                          {(item.descriptionNe || item.descriptionEn) && (
                            <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-1">
                              {item.descriptionNe || item.descriptionEn}
                            </p>
                          )}
                        </div>
                      </div>

                      {item.icon && <div className="shrink-0">{renderIcon(item.icon)}</div>}
                    </div>

                    <div className="mt-4 pt-2.5 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>
                        {isLeaf ? 'कारोबार फाराम खोल्नुहोस्' : `${item.children?.length || 0} वटा उप-योजनाहरू`}
                      </span>
                      <span className="flex items-center gap-1 text-blue-400">
                        <span>[{item.code}] वा Enter</span>
                        <ChevronRight className="size-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Terminal Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Unako CBS Core Terminal v2.4 (Active Session)</span>
          </div>
          <div>
            <span>सहायताका लागि ? थिच्नुहोस्</span>
          </div>
        </div>
      </div>
    </div>
  );
};
