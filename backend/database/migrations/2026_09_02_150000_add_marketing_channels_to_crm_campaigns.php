<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('crm_campaigns', function (Blueprint $table) {
            if (! Schema::hasColumn('crm_campaigns', 'channels')) {
                $table->json('channels')->nullable()->after('message');
            }
            if (! Schema::hasColumn('crm_campaigns', 'email_sent_count')) {
                $table->unsignedInteger('email_sent_count')->default(0)->after('recipient_count');
            }
            if (! Schema::hasColumn('crm_campaigns', 'whatsapp_sent_count')) {
                $table->unsignedInteger('whatsapp_sent_count')->default(0)->after('email_sent_count');
            }
            if (! Schema::hasColumn('crm_campaigns', 'in_app_sent_count')) {
                $table->unsignedInteger('in_app_sent_count')->default(0)->after('whatsapp_sent_count');
            }
        });

        Schema::table('crm_campaign_recipients', function (Blueprint $table) {
            if (! Schema::hasColumn('crm_campaign_recipients', 'delivery_meta')) {
                $table->json('delivery_meta')->nullable()->after('status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('crm_campaign_recipients', function (Blueprint $table) {
            if (Schema::hasColumn('crm_campaign_recipients', 'delivery_meta')) {
                $table->dropColumn('delivery_meta');
            }
        });

        Schema::table('crm_campaigns', function (Blueprint $table) {
            $columns = ['channels', 'email_sent_count', 'whatsapp_sent_count', 'in_app_sent_count'];
            foreach ($columns as $column) {
                if (Schema::hasColumn('crm_campaigns', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
