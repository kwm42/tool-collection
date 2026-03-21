import { useState, useMemo } from 'react';
import { SearchBar } from './components/SearchBar';
import { CategoryTabs } from './components/CategoryTabs';
import { ScriptCard } from './components/ScriptCard';
import { FrequentScripts } from './components/FrequentScripts';
import { scripts } from './data/scripts';
import { useFrequentScripts } from './hooks/useFrequentScripts';
import type { Category } from './types';

const categories: Category[] = ['全部', 'FFmpeg', 'Git', 'ImageMagick', 'Shell'];

function App() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Category>('全部');
  const { frequentScripts, incrementUsage } = useFrequentScripts();

  const filteredScripts = useMemo(() => {
    return scripts.filter((script) => {
      const matchesCategory = category === '全部' || script.category === category;
      const matchesSearch =
        search === '' ||
        script.name.toLowerCase().includes(search.toLowerCase()) ||
        script.description.toLowerCase().includes(search.toLowerCase()) ||
        script.command.toLowerCase().includes(search.toLowerCase()) ||
        script.tags?.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  const handleScriptCopy = (scriptId: string) => {
    incrementUsage(scriptId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-violet-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Script Collection</h1>
            <p className="text-gray-500">命令行脚本收藏库 | 支持搜索和一键复制</p>
          </div>
          <div className="max-w-xl mx-auto">
            <SearchBar value={search} onChange={setSearch} />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <FrequentScripts
          frequentScripts={frequentScripts}
          onCopy={handleScriptCopy}
        />

        <div className="mb-6">
          <CategoryTabs categories={categories} active={category} onChange={setCategory} />
        </div>

        {filteredScripts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">未找到匹配的命令</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredScripts.map((script) => (
              <ScriptCard
                key={script.id}
                script={script}
                onCopy={() => handleScriptCopy(script.id)}
              />
            ))}
          </div>
        )}

        <div className="text-center mt-8 text-gray-400 text-sm">
          共 {filteredScripts.length} 条命令
        </div>
      </main>

      <footer className="text-center py-6 text-gray-400 text-sm">
        <a href="../index.html" className="hover:text-violet-600 transition-colors">
          ← 返回工具集
        </a>
      </footer>
    </div>
  );
}

export default App;
