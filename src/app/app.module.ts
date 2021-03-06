import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';

import { AppComponent } from './app.component';
import { AppMaterialModule } from './material.module';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule} from '@ngrx/store-devtools';
import { RedisStoreModule } from './store/store.module';
import { StorageService } from './services/storage.service';
import { TreeComponent } from './components/tree/tree.component';
import { RedisInstanceComponent } from './components/redis-instance/redis-instance.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddRedisModalComponent } from './components/add-redis-modal/add-redis-modal.component';
import { RootInfoComponent } from './components/root-info/root-info.component';
import { AddKeyModalComponent } from './components/add-key-modal/add-key-modal.component';
import { NodeRootComponent } from './components/node-root/node-root.component';
import { StringViewerComponent } from './components/string-viewer/string-viewer.component';
import { environment } from '../environments/environment';
import { ListViewerComponent } from './components/list-viewer/list-viewer.component';
import { EllipsisPipe } from './pipes/ellipsis.pipe';
import { CapitalizePipe } from './pipes/capitalize.pipe';
import { RootContainerComponent } from './components/root-container/root-container.component';
import { LremDialogComponent } from './components/lrem-dialog/lrem-dialog.component';
import { CliContainerComponent } from 'src/app/components/cli-container/cli-container.component';
import { CliComponent } from './components/cli/cli.component';
import { RenameDialogComponent } from './components/rename-dialog/rename-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    RootContainerComponent,
    TreeComponent,
    RedisInstanceComponent,
    AddRedisModalComponent,
    AddKeyModalComponent,
    RootInfoComponent,
    NodeRootComponent,
    StringViewerComponent,
    ListViewerComponent,
    LremDialogComponent,
    RenameDialogComponent,
    CliContainerComponent,
    CliComponent,

    EllipsisPipe,
    CapitalizePipe
  ],
  entryComponents: [AddRedisModalComponent, AddKeyModalComponent, LremDialogComponent, RenameDialogComponent],
  imports: [
    BrowserModule,
    NoopAnimationsModule,
    AppMaterialModule,
    FormsModule,
    ReactiveFormsModule,
    CodemirrorModule,
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
