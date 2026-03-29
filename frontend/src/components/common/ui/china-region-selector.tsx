import React, { useState, useEffect } from 'react';
import { Loader2, Check, ChevronsUpDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/common/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/common/ui/popover';

interface Region {
  code: string;
  name: string;
  children?: Region[];
}

interface ChinaRegionSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

const DATA_URL = 'https://registry.npmmirror.com/china-division/latest/files/dist/pca-code.json';

export const ChinaRegionSelector: React.FC<ChinaRegionSelectorProps> = ({
  value,
  onChange,
  className
}) => {
  const [data, setData] = useState<Region[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'province' | 'city' | 'district'>('province');

  // Selection states
  const [selectedProvince, setSelectedProvince] = useState<Region | null>(null);
  const [selectedCity, setSelectedCity] = useState<Region | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<Region | null>(null);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const cachedData = localStorage.getItem('china-region-data');
        if (cachedData) {
          setData(JSON.parse(cachedData));
          return;
        }

        setLoading(true);
        const response = await fetch(DATA_URL);
        if (!response.ok) throw new Error('Failed to fetch region data');
        const jsonData = await response.json();

        setData(jsonData);
        localStorage.setItem('china-region-data', JSON.stringify(jsonData));
      } catch (err) {
        console.error('Error fetching region data:', err);
        setError('加载地区数据失败');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Sync internal state with value prop
  useEffect(() => {
    if (!data.length || !value) {
        if (!value) {
            setSelectedProvince(null);
            setSelectedCity(null);
            setSelectedDistrict(null);
        }
        return;
    }

    const currentString = `${selectedProvince?.name || ''}${selectedCity?.name || ''}${selectedDistrict?.name || ''}`;
    if (value === currentString) return;

    let remaining = value;

    const province = data.find(p => remaining.startsWith(p.name));
    if (province) {
      setSelectedProvince(province);
      remaining = remaining.slice(province.name.length);

      if (province.children) {
        const city = province.children.find(c => remaining.startsWith(c.name));
        if (city) {
          setSelectedCity(city);
          remaining = remaining.slice(city.name.length);

          if (city.children) {
            const district = city.children.find(d => remaining.startsWith(d.name));
            if (district) {
              setSelectedDistrict(district);
            } else {
                setSelectedDistrict(null);
            }
          } else {
              setSelectedDistrict(null);
          }
        } else {
            setSelectedCity(null);
            setSelectedDistrict(null);
        }
      } else {
          setSelectedCity(null);
          setSelectedDistrict(null);
      }
    } else {
        setSelectedProvince(null);
        setSelectedCity(null);
        setSelectedDistrict(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, value]);

  // Open popover handling
  useEffect(() => {
    if (open) {
      if (!selectedProvince) setActiveTab('province');
      else if (!selectedCity) setActiveTab('city');
      else setActiveTab('district');
    }
  }, [open, selectedProvince, selectedCity]);

  const handleSelectProvince = (province: Region) => {
    setSelectedProvince(province);
    setSelectedCity(null);
    setSelectedDistrict(null);
    setActiveTab('city');
    onChange(province.name);
  };

  const handleSelectCity = (city: Region) => {
    setSelectedCity(city);
    setSelectedDistrict(null);
    setActiveTab('district');
    onChange((selectedProvince?.name || '') + city.name);
  };

  const handleSelectDistrict = (district: Region) => {
    setSelectedDistrict(district);
    setOpen(false);
    onChange((selectedProvince?.name || '') + (selectedCity?.name || '') + district.name);
  };

  const getDisplayText = () => {
    if (selectedProvince) {
      return `${selectedProvince.name}${selectedCity?.name || ''}${selectedDistrict?.name || ''}`;
    }
    return "请选择省市区";
  };

  if (loading && !data.length) {
    return (
      <Button variant="outline" disabled className={cn("w-full justify-between", className)}>
        <span className="flex items-center">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          正在加载地区数据...
        </span>
      </Button>
    );
  }

  if (error && !data.length) {
    return <div className="text-sm text-destructive">{error}</div>;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between font-normal", !value && "text-muted-foreground", className)}
        >
          {getDisplayText()}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <div className="flex flex-col h-[300px]">
          {/* Tabs Header */}
          <div className="flex items-center border-b p-2 bg-muted/40">
            <div
              className={cn(
                "cursor-pointer text-sm px-3 py-1.5 rounded-md hover:bg-accent/80 transition-all duration-200",
                activeTab === 'province'
                  ? "font-semibold text-primary-foreground bg-primary shadow-sm ring-1 ring-primary/20"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setActiveTab('province')}
            >
              {selectedProvince?.name || '选择省份'}
            </div>
            {selectedProvince && (
              <>
                <ChevronRight className="h-4 w-4 text-muted-foreground/60 mx-1" />
                <div
                  className={cn(
                    "cursor-pointer text-sm px-3 py-1.5 rounded-md hover:bg-accent/80 transition-all duration-200",
                    activeTab === 'city'
                      ? "font-semibold text-primary-foreground bg-primary shadow-sm ring-1 ring-primary/20"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setActiveTab('city')}
                >
                  {selectedCity?.name || '选择城市'}
                </div>
              </>
            )}
            {selectedCity && (
              <>
                <ChevronRight className="h-4 w-4 text-muted-foreground/60 mx-1" />
                <div
                  className={cn(
                    "cursor-pointer text-sm px-3 py-1.5 rounded-md hover:bg-accent/80 transition-all duration-200",
                    activeTab === 'district'
                      ? "font-semibold text-primary-foreground bg-primary shadow-sm ring-1 ring-primary/20"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setActiveTab('district')}
                >
                  {selectedDistrict?.name || '选择区县'}
                </div>
              </>
            )}
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {activeTab === 'province' && (
              data.map(province => (
                <div
                  key={province.code}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 text-sm rounded-md cursor-pointer transition-colors duration-150",
                    selectedProvince?.code === province.code
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={() => handleSelectProvince(province)}
                >
                  {province.name}
                  {selectedProvince?.code === province.code && <Check className="h-4 w-4 text-primary" />}
                </div>
              ))
            )}

            {activeTab === 'city' && selectedProvince && (
              selectedProvince.children?.map(city => (
                <div
                  key={city.code}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 text-sm rounded-md cursor-pointer transition-colors duration-150",
                    selectedCity?.code === city.code
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={() => handleSelectCity(city)}
                >
                  {city.name}
                  {selectedCity?.code === city.code && <Check className="h-4 w-4 text-primary" />}
                </div>
              ))
            )}

            {activeTab === 'district' && selectedCity && (
              selectedCity.children?.map(district => (
                <div
                  key={district.code}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 text-sm rounded-md cursor-pointer transition-colors duration-150",
                    selectedDistrict?.code === district.code
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={() => handleSelectDistrict(district)}
                >
                  {district.name}
                  {selectedDistrict?.code === district.code && <Check className="h-4 w-4 text-primary" />}
                </div>
              ))
            )}

            {/* Empty States */}
            {activeTab === 'city' && !selectedProvince && (
              <div className="text-sm text-muted-foreground text-center py-4">请先选择省份</div>
            )}
            {activeTab === 'district' && !selectedCity && (
              <div className="text-sm text-muted-foreground text-center py-4">请先选择城市</div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
