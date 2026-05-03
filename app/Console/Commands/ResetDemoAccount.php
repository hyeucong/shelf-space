<?php

namespace App\Console\Commands;

use Database\Seeders\DemoSeeder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class ResetDemoAccount extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:reset-demo';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Resets the demo account data to its original state.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Resetting demo account...');

        Artisan::call('db:seed', [
            '--class' => DemoSeeder::class,
        ]);

        $this->info('Demo account reset successfully.');
    }
}
