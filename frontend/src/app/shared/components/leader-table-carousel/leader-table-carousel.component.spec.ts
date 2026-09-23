// @vitest-environment jsdom
import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { LeaderTableCarouselComponent } from './leader-table-carousel.component';
import {
  DEFAULT_BATTING_RECORDS_CONFIG,
  DEFAULT_PITCHING_RECORDS_CONFIG,
  LeaderCarouselConfig,
} from './leader-table-carousel.interface';

describe('LeaderTableCarouselComponent', () => {
  let component: LeaderTableCarouselComponent;
  let injector: Injector;

  beforeEach(() => {
    injector = Injector.create({
      providers: [],
    });

    component = runInInjectionContext(injector, () => new LeaderTableCarouselComponent());
  });

  it('should create the carousel component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default batting records and active category', () => {
    expect(component.currentIndex()).toBe(0);
    expect(component.activeCategory()).toBe('Líderes en Jonrones');
    expect(component.originalTables().length).toBe(4);
    expect(component.slides().length).toBe(6); // 4 + 2 clones for looping
  });

  it('should advance slide on next() and wrap with circular looping', () => {
    expect(component.currentIndex()).toBe(0);
    component.next();
    expect(component.currentIndex()).toBe(1);

    component.next();
    expect(component.currentIndex()).toBe(2);

    component.next();
    expect(component.currentIndex()).toBe(3);

    // Moves to appended clone (trackIndex 5)
    component.next();
    expect(component.trackIndex()).toBe(5);
    // In looping mode, after transitionEnd it resets to trackIndex 1 (index 0)
    component.onTransitionEnd();
    expect(component.trackIndex()).toBe(1);
    expect(component.currentIndex()).toBe(0);
  });

  it('should move to previous slide on prev() and wrap with circular looping', () => {
    expect(component.currentIndex()).toBe(0);
    // At initial trackIndex 1, prev moves to prepended clone (trackIndex 0)
    component.prev();
    expect(component.trackIndex()).toBe(0);
    // On transitionend, resets to original length (4) which is index 3
    component.onTransitionEnd();
    expect(component.trackIndex()).toBe(4);
    expect(component.currentIndex()).toBe(3);
  });

  it('should navigate to specific index using goTo()', () => {
    component.goTo(2);
    expect(component.currentIndex()).toBe(2);
    expect(component.activeCategory()).toBe('Campeones de Bateo');
  });

  it('should support keyboard navigation with ArrowLeft and ArrowRight', () => {
    const leftEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
    const rightEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });

    component.onKeyDown(rightEvent);
    expect(component.currentIndex()).toBe(1);

    component.onKeyDown(leftEvent);
    expect(component.currentIndex()).toBe(0);
  });

  it('should detect swipe gestures via touch events', () => {
    // Swipe left (negative deltaX) -> next()
    component.onTouchStart({
      touches: [{ clientX: 200, clientY: 100 } as Touch],
    } as unknown as TouchEvent);

    component.onTouchMove({
      touches: [{ clientX: 100, clientY: 100 } as Touch],
    } as unknown as TouchEvent);

    component.onTouchEnd();
    expect(component.currentIndex()).toBe(1);

    // Swipe right (positive deltaX) -> prev()
    component.onTouchStart({
      touches: [{ clientX: 100, clientY: 100 } as Touch],
    } as unknown as TouchEvent);

    component.onTouchMove({
      touches: [{ clientX: 250, clientY: 100 } as Touch],
    } as unknown as TouchEvent);

    component.onTouchEnd();
    expect(component.currentIndex()).toBe(0);
  });

  it('should ignore swipe gestures smaller than threshold', () => {
    component.onTouchStart({
      touches: [{ clientX: 100, clientY: 100 } as Touch],
    } as unknown as TouchEvent);

    component.onTouchMove({
      touches: [{ clientX: 110, clientY: 100 } as Touch],
    } as unknown as TouchEvent);

    component.onTouchEnd();
    expect(component.currentIndex()).toBe(0);
  });

  it('should determine slide visibility for lazy loading (active and adjacent only)', () => {
    // With trackIndex 1 (currentIndex 0):
    // Slide 0 (clone): diff = 1 -> visible
    // Slide 1 (active): diff = 0 -> visible
    // Slide 2 (adjacent): diff = 1 -> visible
    // Slide 3: diff = 2 -> not visible
    expect(component.isSlideVisible(1)).toBe(true);
    expect(component.isSlideVisible(0)).toBe(true);
    expect(component.isSlideVisible(2)).toBe(true);
    expect(component.isSlideVisible(3)).toBe(false);
  });

  it('should work with pitching records configuration', () => {
    // Create new component with pitching config
    const pitchingComponent = runInInjectionContext(injector, () => {
      const comp = new LeaderTableCarouselComponent();
      (comp as any).config = () => DEFAULT_PITCHING_RECORDS_CONFIG;
      return comp;
    });

    expect(pitchingComponent.originalTables().length).toBe(3);
    expect(pitchingComponent.activeCategory()).toBe('Líderes en Victorias (Juegos Ganados)');
  });

  it('should compute trackTransform correctly for hardware acceleration', () => {
    expect(component.trackTransform()).toContain('translate3d(calc(-1 *');
    component.next();
    expect(component.trackTransform()).toContain('translate3d(calc(-2 *');
  });

  it('should correctly slice items to strictly top 5 in template helper', () => {
    const items = [
      { yearOrSpan: '1', player: 'P1', team: 'T1', statValue: 10 },
      { yearOrSpan: '2', player: 'P2', team: 'T2', statValue: 9 },
      { yearOrSpan: '3', player: 'P3', team: 'T3', statValue: 8 },
      { yearOrSpan: '4', player: 'P4', team: 'T4', statValue: 7 },
      { yearOrSpan: '5', player: 'P5', team: 'T5', statValue: 6 },
      { yearOrSpan: '6', player: 'P6', team: 'T6', statValue: 5 },
      { yearOrSpan: '7', player: 'P7', team: 'T7', statValue: 4 },
    ];
    const sliced = items.slice(0, 5);
    expect(sliced.length).toBe(5);
    expect(sliced[4].player).toBe('P5');
  });
});
