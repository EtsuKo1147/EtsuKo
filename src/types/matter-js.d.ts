declare module 'matter-js' {
  export interface Vector {
    x: number
    y: number
  }

  export interface Body {
    position: Vector
    velocity: Vector
    angle: number
    angularVelocity: number
  }

  export interface Composite {
    bodies?: Body[]
  }

  export interface Engine {
    world: Composite
    gravity: Vector
  }

  export interface Runner {
    enabled?: boolean
  }

  export interface BodyOptions {
    isStatic?: boolean
    density?: number
    friction?: number
    frictionAir?: number
    restitution?: number
  }

  const Matter: {
    Engine: {
      create(options?: Record<string, unknown>): Engine
      clear(engine: Engine): void
    }
    Runner: {
      create(options?: Record<string, unknown>): Runner
      run(runner: Runner, engine: Engine): void
      stop(runner: Runner): void
    }
    Bodies: {
      rectangle(
        x: number,
        y: number,
        width: number,
        height: number,
        options?: BodyOptions,
      ): Body
    }
    Body: {
      setAngle(body: Body, angle: number): void
      setAngularVelocity(body: Body, velocity: number): void
      setPosition(body: Body, position: Vector): void
      setVelocity(body: Body, velocity: Vector): void
    }
    Composite: {
      add(composite: Composite, object: Body | Body[]): void
      clear(composite: Composite, keepStatic?: boolean): void
    }
    Events: {
      on(engine: Engine, eventName: string, callback: () => void): void
      off(engine: Engine, eventName: string, callback: () => void): void
    }
  }

  export default Matter
}
