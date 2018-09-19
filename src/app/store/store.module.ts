import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { reducers, metaReducers } from './reducers';
import { EffectsModule } from '@ngrx/effects';
import { RedisEffects } from './effects/redis';
import { RedisSocketService } from './services/redissocket.service';

@NgModule({
    declarations: [ ],
    imports: [
        BrowserModule,
        StoreModule.forFeature('redis', reducers, {metaReducers: metaReducers}),
        EffectsModule.forFeature([RedisEffects])
    ],
    providers: [RedisSocketService],
})
export class RedisStoreModule {}
