import React from 'react';
import LegalLayout from '@/components/layout/LegalLayout';
import { Card, CardContent } from '@/components/common/ui/card';
import { Mail, MapPin, Globe, Users, History, Target } from 'lucide-react';

const About: React.FC = () => {
  return (
    <LegalLayout title="关于我们" lastUpdated="2026-02-25">
      <div className="space-y-8 text-foreground">
        <section>
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Globe className="mr-2 text-primary" size={20} />
            公司简介
          </h3>
          <p className="leading-relaxed text-muted-foreground">
            SSQ Master（双色球预测大师）是一家致力于将现代人工智能技术与传统中华术数智慧相结合的创新型科技公司。
            我们通过深度学习算法分析历史数据，同时融合梅花易数、奇门遁甲等传统预测方法，为彩票爱好者提供多维度的分析工具和决策参考。
            我们的目标不是鼓励赌博，而是通过科学与文化的碰撞，探索数字背后的规律与乐趣。
          </p>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Target className="mr-2 text-primary" size={20} />
            使命与愿景
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <h4 className="font-bold mb-2">我们的使命</h4>
                <p className="text-sm text-muted-foreground">
                  利用前沿科技解读随机性，传承中华传统文化，为用户提供理性、有趣、深度的数字分析体验。
                </p>
              </CardContent>
            </Card>
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <h4 className="font-bold mb-2">我们的愿景</h4>
                <p className="text-sm text-muted-foreground">
                  成为全球领先的数字彩票分析平台，构建连接科技与传统的桥梁，倡导理性购彩的健康生活方式。
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Users className="mr-2 text-primary" size={20} />
            核心团队
          </h3>
          <p className="leading-relaxed text-muted-foreground mb-4">
            我们的团队由来自顶尖互联网公司的数据科学家、全栈工程师以及深耕易学多年的传统文化研究者组成。
            这种独特的跨界组合，使我们能够打破常规，创造出兼具科技感与文化底蕴的产品。
          </p>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li><strong>技术研发部：</strong>负责AI模型训练、大数据处理及平台架构搭建。</li>
            <li><strong>传统文化研究院：</strong>负责古籍整理、算法数字化及术数模型构建。</li>
            <li><strong>产品运营中心：</strong>致力于提升用户体验，打造活跃的社区氛围。</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <History className="mr-2 text-primary" size={20} />
            发展历程
          </h3>
          <div className="border-l-2 border-primary/20 pl-4 space-y-4">
            <div>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">2024年</span>
              <p className="text-sm mt-1 text-muted-foreground">项目启动，确立"AI+易学"的核心方向。</p>
            </div>
            <div>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">2025年</span>
              <p className="text-sm mt-1 text-muted-foreground">SSQ Master 1.0版本上线，获得首批种子用户好评。</p>
            </div>
            <div>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">2026年</span>
              <p className="text-sm mt-1 text-muted-foreground">引入深度学习大模型，预测准确率显著提升，用户规模突破百万。</p>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Mail className="mr-2 text-primary" size={20} />
            联系方式
          </h3>
          <div className="bg-secondary/20 p-4 rounded-lg space-y-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin size={16} className="mr-2" />
              <span>总部地址：北京市海淀区中关村科技园创新大厦A座</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Mail size={16} className="mr-2" />
              <span>商务合作：business@ssqmaster.com</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Users size={16} className="mr-2" />
              <span>客户支持：support@ssqmaster.com</span>
            </div>
          </div>
        </section>
      </div>
    </LegalLayout>
  );
};

export default About;
