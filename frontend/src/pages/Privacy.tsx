import React from 'react';
import LegalLayout from '@/components/layout/LegalLayout';
import { Shield, Eye, Lock, Database, FileText, Users } from 'lucide-react';

const Privacy: React.FC = () => {
  return (
    <LegalLayout title="隐私政策" lastUpdated="2026-02-25">
      <div className="space-y-8 text-foreground">
        <section>
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Shield className="mr-2 text-primary" size={20} />
            引言
          </h3>
          <p className="leading-relaxed text-muted-foreground">
            SSQ Master（以下简称"我们"）深知个人信息对您的重要性，我们将按照法律法规要求，采取相应安全保护措施，尽力保护您的个人信息安全可控。
            鉴于此，我们制定本《隐私政策》（以下简称"本政策"）并提醒您：
            <br />
            在使用我们的产品或服务前，请您务必仔细阅读并透彻理解本政策，在确认充分理解并同意后使用相关产品或服务。
          </p>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Database className="mr-2 text-primary" size={20} />
            我们收集的信息类型
          </h3>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li><strong>注册信息：</strong>当您创建账户时，我们可能会收集您的手机号码、电子邮箱地址、用户名和密码。</li>
            <li><strong>使用数据：</strong>我们会自动收集您在使用服务过程中的日志信息，包括访问时间、浏览记录、点击操作、IP地址、设备型号、操作系统版本等。</li>
            <li><strong>预测记录：</strong>您在使用预测功能时生成的历史记录、收藏号码等偏好数据。</li>
            <li><strong>支付信息：</strong>若您使用付费服务，我们会通过第三方支付机构收集必要的交易信息，但不会直接存储您的银行卡号或完整支付凭证。</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Eye className="mr-2 text-primary" size={20} />
            信息的使用目的
          </h3>
          <p className="leading-relaxed text-muted-foreground mb-4">
            我们将收集的信息用于以下用途：
          </p>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>提供、维护和改进我们的服务功能。</li>
            <li>个性化展示预测结果，根据您的偏好推荐内容。</li>
            <li>向您发送服务通知、安全验证码或营销信息（您可随时退订）。</li>
            <li>进行数据分析和研究，优化AI算法模型的准确性。</li>
            <li>检测和防范欺诈、滥用或其他有害活动，保障账户安全。</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Lock className="mr-2 text-primary" size={20} />
            信息的存储与保护
          </h3>
          <p className="leading-relaxed text-muted-foreground">
            我们将您的个人信息存储在位于中国境内的安全服务器上。
            我们采用行业通用的加密技术（如SSL/TLS）、访问控制机制和匿名化处理手段来保护您的数据。
            除非法律法规另有规定，我们仅在为实现目的所必需的时间内保留您的个人信息。
          </p>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <FileText className="mr-2 text-primary" size={20} />
            Cookie政策
          </h3>
          <p className="leading-relaxed text-muted-foreground">
            为确保网站正常运转，我们会在您的计算机或移动设备上存储名为Cookie的小数据文件。
            Cookie通常包含标识符、站点名称以及一些号码和字符。
            借助于Cookie，网站能够存储您的偏好数据。
            我们不会将Cookie用于本政策所述目的之外的任何用途。您可根据自己的偏好管理或删除Cookie。
          </p>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Shield className="mr-2 text-primary" size={20} />
            第三方共享规则
          </h3>
          <p className="leading-relaxed text-muted-foreground">
            目前，我们不会主动共享或转让您的个人信息至第三方，除非：
          </p>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>获得您的明确同意。</li>
            <li>根据法律法规、行政或司法强制要求。</li>
            <li>在合并、收购或资产转让等交易中，如涉及个人信息转让，我们会要求受让方继续受本政策约束。</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Users className="mr-2 text-primary" size={20} />
            用户权利
          </h3>
          <p className="leading-relaxed text-muted-foreground">
            按照中国相关的法律、法规、标准，我们保障您对自己的个人信息行使以下权利：
            访问权、更正权、删除权、撤回同意权以及注销账户权。
            您可以通过应用内的设置选项或联系我们的客服团队来行使这些权利。
          </p>
        </section>
      </div>
    </LegalLayout>
  );
};

export default Privacy;
