import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { reducers, metaReducers } from './reducers';
import { EffectsModule } from '@ngrx/effects';
import { RedisEffects } from './effects/redis';
import { RedisSocketService } from './services/redissocket.service';

@NgModule({
    declarations: [ ],
    imports: [
        StoreModule.forFeature('redis', reducers, {metaReducers: metaReducers}),
        EffectsModule.forFeature([RedisEffects])
    ],
    providers: [RedisSocketService],
})
export class RedisStoreModule {}
