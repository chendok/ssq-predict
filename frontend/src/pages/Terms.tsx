import React from 'react';
import LegalLayout from '@/components/layout/LegalLayout';
import { Gavel, AlertCircle, FileText, Scale, Settings } from 'lucide-react';

const Terms: React.FC = () => {
  return (
    <LegalLayout title="服务条款" lastUpdated="2026-02-25">
      <div className="space-y-8 text-foreground">
        <section>
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Gavel className="mr-2 text-primary" size={20} />
            协议范围
          </h3>
          <p className="leading-relaxed text-muted-foreground">
            本《服务条款》（以下简称"本协议"）是您与SSQ Master（以下简称"我们"或"平台"）之间关于您使用SSQ Master平台所订立的协议。
            本协议适用于您访问、浏览和使用SSQ Master网站及其相关服务（包括但不限于AI预测、术数分析、历史查询等）。
            若您不同意本协议的任何内容，或者无法准确理解本协议条款的含义，请您立即停止使用本服务。
          </p>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <AlertCircle className="mr-2 text-primary" size={20} />
            用户责任
          </h3>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li><strong>年龄限制：</strong>您确认已年满18周岁，具有完全民事行为能力。未成年人不得使用本服务。</li>
            <li><strong>账号安全：</strong>您应妥善保管您的账号和密码，并对您账号下的所有活动承担法律责任。如发现账号被盗用，请立即通知我们。</li>
            <li><strong>合法使用：</strong>您承诺不利用本服务从事任何违法违规活动，包括但不限于发布虚假信息、传播病毒、侵犯他人权益等。</li>
            <li><strong>理性购彩：</strong>本平台提供的预测结果仅供参考，不作为购彩依据。您应理性对待彩票，切勿沉迷。</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <FileText className="mr-2 text-primary" size={20} />
            知识产权声明
          </h3>
          <p className="leading-relaxed text-muted-foreground">
            SSQ Master平台内的所有内容（包括但不限于文字、图片、音频、视频、图表、界面设计、版面框架、数据资料、程序、代码等）的知识产权均归我们所有。
            未经我们书面许可，您不得以任何方式（包括但不限于复制、转载、抓取、镜像等）使用或许可他人使用上述内容。
            任何未经授权的使用均构成侵权，我们将依法追究法律责任。
          </p>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Scale className="mr-2 text-primary" size={20} />
            免责声明
          </h3>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li><strong>预测结果：</strong>彩票具有随机性，本平台提供的AI预测和术数分析结果仅基于历史数据和算法模型生成，不保证准确性，亦不构成任何投资建议或承诺。</li>
            <li><strong>服务中断：</strong>因网络故障、系统维护、不可抗力等原因导致的服务中断或延迟，我们不承担赔偿责任，但会尽力减少影响。</li>
            <li><strong>第三方链接：</strong>本平台可能包含指向第三方网站的链接，我们对第三方网站的内容、隐私政策或安全性不承担责任。</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Gavel className="mr-2 text-primary" size={20} />
            争议解决
          </h3>
          <p className="leading-relaxed text-muted-foreground">
            本协议的订立、执行和解释及争议的解决均应适用中华人民共和国法律。
            如双方就本协议内容或其执行发生任何争议，双方应尽量友好协商解决；协商不成时，任何一方均可向被告所在地有管辖权的人民法院提起诉讼。
          </p>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Settings className="mr-2 text-primary" size={20} />
            协议修改
          </h3>
          <p className="leading-relaxed text-muted-foreground">
            我们需要根据法律法规变化或业务发展需要，不时修改本协议。
            变更后的协议将通过网站公告或站内信等方式通知您。
            若您在协议变更后继续使用本服务，即表示您已充分阅读、理解并接受修改后的协议内容。
          </p>
        </section>
      </div>
    </LegalLayout>
  );
};

export default Terms;
