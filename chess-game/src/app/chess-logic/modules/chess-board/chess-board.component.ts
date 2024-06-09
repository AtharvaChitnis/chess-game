import { Component } from '@angular/core';
import { Color, FENChar, Coords, CheckState } from '../../models';
import { ChessBoard } from '../../chess-board';
import { SelectedSquare } from './models';

@Component({
  selector: 'app-chess-board',
  standalone: true,
  imports: [],
  templateUrl: './chess-board.component.html',
  styleUrl: './chess-board.component.css',
})
export class ChessBoardComponent {
  public pieceImagePaths = pieceImagePaths;

  private chessBoard = new ChessBoard();
  public chessBoardView: (FENChar | null)[][] = this.chessBoard.chessBoardView;
  public get playerColor(): Color {
    return this.chessBoard.playerColor;
  }
  public selectedSquare: SelectedSquare = { piece: null };
  public pieceSafeSquare: Coords[] = [];
  private checkState: CheckState = this.chessBoard.checkState;

  public isSquareDark(x: number, y: number): boolean {
    return ChessBoard.isSquareDark(x, y);
  }
}
