import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { AppMaterialModule } from './material.module';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule} from '@ngrx/store-devtools';
import { RedisStoreModule } from './store/store.module';
import { environment } from '../environments/environment';
import { StorageService } from './services/storage.service';
import { TreeComponent } from './components/tree/tree.component';
import { RedisInstanceComponent } from './components/redis-instance/redis-instance.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddRedisModalComponent } from './components/add-redis-modal/add-redis-modal.component';

@NgModule({
  declarations: [
    AppComponent,
    TreeComponent,
    RedisInstanceComponent,
    AddRedisModalComponent
  ],
  entryComponents: [AddRedisModalComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppMaterialModule,
    FormsModule,
    ReactiveFormsModule,

    StoreModule.forRoot({}),
    EffectsModule.forRoot([]),
    // StoreDevtoolsModule.instrument({
    //   maxAge: 25, // Retains last 25 states
    //   logOnly: environment.production, // Restrict extension to log-only mode
    // }),
    RedisStoreModule,
  ],
  providers: [StorageService],
  bootstrap: [AppComponent]
})
export class AppModule { }
