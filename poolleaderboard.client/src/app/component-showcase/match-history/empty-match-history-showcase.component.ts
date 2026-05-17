import { Component } from '@angular/core';
import { MatchHistoryComponent } from '../../match-history/presenters/match-history.component';

@Component({
  selector: 'app-empty-match-history-showcase',
  imports: [MatchHistoryComponent],
  template: `
    <app-match-history [entries]="[]" [total]="0" [pageIndex]="0" [pageSize]="10"></app-match-history>
  `,
  styles: ``
})
export class EmptyMatchHistoryShowcaseComponent {}
