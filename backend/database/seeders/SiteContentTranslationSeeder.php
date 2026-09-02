<?php

namespace Database\Seeders;

use App\Models\SiteContent;
use Illuminate\Database\Seeder;

class SiteContentTranslationSeeder extends Seeder
{
    public function run(): void
    {
        $translations = [
            'zh' => $this->chinese(),
            'vi' => $this->vietnamese(),
            'fr' => $this->french(),
        ];

        foreach ($translations as $locale => $sections) {
            foreach ($sections as $key => $content) {
                SiteContent::updateSection($key, $content, $locale);
            }
        }
    }

    /** @return array<string, array<string, mixed>> */
    private function chinese(): array
    {
        return [
            'header' => [
                'nav' => [
                    ['label' => '旅游', 'href' => '/tours', 'visible' => true],
                    ['label' => '徒步', 'href' => '/trekking', 'visible' => true],
                    ['label' => '冒险假期', 'href' => '/adventure', 'visible' => true],
                    ['label' => '为什么选择我们', 'href' => '/why-us', 'visible' => true],
                    ['label' => '博客', 'href' => '/blog', 'visible' => true],
                    ['label' => '联系我们', 'href' => '/contact', 'visible' => true],
                ],
                'login_label' => '登录',
                'account_label' => '我的账户',
            ],
            'footer' => [
                'about_title' => 'Anytime Nepal Trek',
                'about_text' => '探索尼泊尔、西藏和不丹隐藏的自然、文化与冒险之美。',
                'quick_links_title' => '快速链接',
                'quick_links' => [
                    ['label' => '关于我们', 'href' => '/about', 'visible' => true],
                    ['label' => '联系我们', 'href' => '/contact', 'visible' => true],
                    ['label' => '安全与保障', 'href' => '/why-us', 'visible' => true],
                    ['label' => '付款信息', 'href' => '/contact', 'visible' => true],
                ],
                'activity_title' => '冒险活动',
                'activity_links' => [
                    ['label' => '旅游', 'href' => '/tours', 'visible' => true],
                    ['label' => '徒步', 'href' => '/trekking', 'visible' => true],
                    ['label' => '冒险假期', 'href' => '/adventure', 'visible' => true],
                ],
                'contact_title' => '联系方式',
            ],
            'home' => [
                'featured' => [
                    'title' => '您要去哪里？',
                    'subtitle' => '选择目的地，发现您的冒险之旅。',
                    'cta_text' => '查看所有徒步路线',
                ],
                'destinations' => [
                    'title' => '一起出发旅行',
                    'subtitle' => '世界很大，去探索吧',
                    'attractions_label' => '热门景点',
                    'cta_text' => '了解更多 →',
                ],
                'best_selling' => [
                    'title' => '最畅销路线',
                    'subtitle' => '您想去哪里旅行？',
                ],
                'season' => [
                    'title' => '当季精选',
                    'subtitle' => '让我们为您打造最佳旅程！',
                    'cta_text' => '探索套餐',
                ],
                'about' => [
                    'title' => '轻松畅游尼泊尔',
                    'cta_text' => '阅读更多',
                    'stat_label' => '年经验',
                    'stat_note' => '深受全球旅行者信赖',
                ],
                'reviews' => [
                    'title' => '旅行者评价',
                    'reviews_label' => '条评价',
                    'travellers_label' => '满意旅行者',
                ],
            ],
            'pages' => [
                'contact' => [
                    'title' => '联系我们',
                    'subtitle' => '我们随时为您提供帮助',
                    'sidebar_title' => '联系信息',
                    'phone_label' => '电话',
                    'email_label' => '电子邮件',
                    'address_label' => '地址',
                    'form_title' => '发送消息',
                    'meta_title' => '联系我们',
                    'meta_description' => '联系 Anytime Nepal Trek，规划您的尼泊尔之旅。',
                ],
            ],
        ];
    }

    /** @return array<string, array<string, mixed>> */
    private function vietnamese(): array
    {
        return [
            'header' => [
                'nav' => [
                    ['label' => 'Tour', 'href' => '/tours', 'visible' => true],
                    ['label' => 'Trekking', 'href' => '/trekking', 'visible' => true],
                    ['label' => 'Kỳ nghỉ phiêu lưu', 'href' => '/adventure', 'visible' => true],
                    ['label' => 'Vì sao chọn chúng tôi', 'href' => '/why-us', 'visible' => true],
                    ['label' => 'Blog', 'href' => '/blog', 'visible' => true],
                    ['label' => 'Liên hệ', 'href' => '/contact', 'visible' => true],
                ],
                'login_label' => 'Đăng nhập',
                'account_label' => 'Tài khoản của tôi',
            ],
            'footer' => [
                'about_text' => 'Khám phá vẻ đẹp thiên nhiên, văn hóa và phiêu lưu ở Nepal, Tây Tạng và Bhutan.',
                'quick_links_title' => 'Liên kết nhanh',
                'quick_links' => [
                    ['label' => 'Về chúng tôi', 'href' => '/about', 'visible' => true],
                    ['label' => 'Liên hệ', 'href' => '/contact', 'visible' => true],
                    ['label' => 'An toàn & Bảo mật', 'href' => '/why-us', 'visible' => true],
                    ['label' => 'Thông tin thanh toán', 'href' => '/contact', 'visible' => true],
                ],
                'activity_title' => 'Hoạt động phiêu lưu',
                'contact_title' => 'Liên hệ',
            ],
            'home' => [
                'featured' => [
                    'title' => 'Bạn muốn đi đâu?',
                    'subtitle' => 'Chọn điểm đến và khám phá chuyến phiêu lưu của bạn.',
                    'cta_text' => 'Xem tất cả trekking',
                ],
                'destinations' => [
                    'title' => 'Cùng nhau đi du lịch',
                    'subtitle' => 'Thế giới rất rộng lớn, hãy khám phá',
                    'attractions_label' => 'Điểm tham quan',
                    'cta_text' => 'Tìm hiểu thêm →',
                ],
                'best_selling' => [
                    'title' => 'Bán chạy nhất',
                    'subtitle' => 'Bạn muốn đi du lịch ở đâu?',
                ],
                'season' => [
                    'title' => 'Chuyến đi của mùa',
                    'subtitle' => 'Hãy tạo chuyến đi tuyệt vời nhất!',
                    'cta_text' => 'Khám phá gói tour',
                ],
                'about' => [
                    'title' => 'Du lịch Nepal đơn giản hơn',
                    'cta_text' => 'Đọc thêm',
                    'stat_label' => 'Năm kinh nghiệm',
                ],
                'reviews' => [
                    'title' => 'Du khách nói gì',
                    'reviews_label' => 'Đánh giá',
                    'travellers_label' => 'Du khách hài lòng',
                ],
            ],
            'pages' => [
                'contact' => [
                    'title' => 'Liên hệ',
                    'subtitle' => 'Chúng tôi luôn sẵn sàng hỗ trợ bạn',
                    'sidebar_title' => 'Thông tin liên hệ',
                    'phone_label' => 'Điện thoại',
                    'email_label' => 'Email',
                    'address_label' => 'Địa chỉ',
                    'form_title' => 'Gửi tin nhắn',
                    'meta_title' => 'Liên hệ',
                    'meta_description' => 'Liên hệ Anytime Nepal Trek để lên kế hoạch chuyến đi Nepal của bạn.',
                ],
            ],
        ];
    }

    /** @return array<string, array<string, mixed>> */
    private function french(): array
    {
        return [
            'header' => [
                'nav' => [
                    ['label' => 'Circuits', 'href' => '/tours', 'visible' => true],
                    ['label' => 'Trekking', 'href' => '/trekking', 'visible' => true],
                    ['label' => 'Vacances aventure', 'href' => '/adventure', 'visible' => true],
                    ['label' => 'Pourquoi nous ?', 'href' => '/why-us', 'visible' => true],
                    ['label' => 'Blog', 'href' => '/blog', 'visible' => true],
                    ['label' => 'Contact', 'href' => '/contact', 'visible' => true],
                ],
                'login_label' => 'Connexion',
                'account_label' => 'Mon compte',
            ],
            'footer' => [
                'about_text' => 'Découvrez la beauté cachée de la nature, de la culture et de l\'aventure au Népal, au Tibet et au Bhoutan.',
                'quick_links_title' => 'Liens rapides',
                'quick_links' => [
                    ['label' => 'À propos', 'href' => '/about', 'visible' => true],
                    ['label' => 'Contact', 'href' => '/contact', 'visible' => true],
                    ['label' => 'Sécurité', 'href' => '/why-us', 'visible' => true],
                    ['label' => 'Paiement', 'href' => '/contact', 'visible' => true],
                ],
                'activity_title' => 'Activités aventure',
                'contact_title' => 'Contact',
            ],
            'home' => [
                'featured' => [
                    'title' => 'Où souhaitez-vous aller ?',
                    'subtitle' => 'Choisissez votre destination et vivez votre aventure.',
                    'cta_text' => 'Voir tous les treks',
                ],
                'destinations' => [
                    'title' => 'Partons voyager',
                    'subtitle' => 'Le monde est vaste, partez explorer',
                    'attractions_label' => 'Attractions touristiques',
                    'cta_text' => 'En savoir plus →',
                ],
                'best_selling' => [
                    'title' => 'Nos best-sellers',
                    'subtitle' => 'Où aimeriez-vous voyager ?',
                ],
                'season' => [
                    'title' => 'Voyage de la saison',
                    'subtitle' => 'Créons votre plus beau voyage !',
                    'cta_text' => 'Explorer le forfait',
                ],
                'about' => [
                    'title' => 'Le Népal simplifié',
                    'cta_text' => 'En savoir plus',
                    'stat_label' => 'Années d\'expérience',
                ],
                'reviews' => [
                    'title' => 'Ce que disent nos voyageurs',
                    'reviews_label' => 'Avis',
                    'travellers_label' => 'Voyageurs satisfaits',
                ],
            ],
            'pages' => [
                'contact' => [
                    'title' => 'Contact',
                    'subtitle' => 'Nous sommes là pour vous aider',
                    'sidebar_title' => 'Coordonnées',
                    'phone_label' => 'Téléphone',
                    'email_label' => 'E-mail',
                    'address_label' => 'Adresse',
                    'form_title' => 'Envoyer un message',
                    'meta_title' => 'Contact',
                    'meta_description' => 'Contactez Anytime Nepal Trek pour planifier votre voyage au Népal.',
                ],
            ],
        ];
    }
}
