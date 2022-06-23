import { Canvas, MeshProps } from "@react-three/fiber";
import { Duplet, Physics, useBox, useCircle } from "@react-three/p2";
import { RefObject, useEffect, useMemo, useRef, useState } from "react";
import { Color, Mesh } from "three";

const gravity = 5;
const centerGravityForce = (pos: number) => {
  const force = Math.max(Math.abs(pos), 1) * gravity;
  return pos > 0 ? -force : force;
};

function App() {
  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <pointLight position={[0.5, 2, 3]} intensity={2} />
      <Physics gravity={[0, 0]} normalIndex={2} stepSize={0.005}>
        <Object position={[-3, 2]} color="green" />
        <Object />
        <Object position={[2.5, 2]} color="blue" type="box" />
        <Object position={[0, -10]} color="hotpink" />
        <Object position={[5, 5]} color="yellow" />
      </Physics>
    </Canvas>
  );
}

export default App;

type BallProps = Omit<MeshProps, "position"> & {
  initialMass?: number;
  color?: Color | string;
  position?: Duplet;
  type?: "ball" | "box";
};

const Object = ({
  type = "ball",
  initialMass = 1,
  color = "red",
  ...props
}: BallProps) => {
  const [size, setSize] = useState(1);
  const prevPos = useRef<Duplet>();
  const mass = useRef<number>(0);
  const [ref, api] = (type === "box" ? useBox : useCircle)(
    //@ts-ignore
    () => {
      mass.current = initialMass * (Math.pow(size, 10));
      return {
        mass: mass.current,
        position: prevPos.current ?? props.position,
        args: [size, size],
      };
    },
    null,
    [size]
  );
  useEffect(() => {
    const unsub = api.position.subscribe((pos) => {
      prevPos.current = pos;
      api.applyForce(
        [centerGravityForce(pos[0]) * mass.current, centerGravityForce(pos[1]) * mass.current],
        [0, 0]
      );

      //ref.current?.scale.addScalar(.001);
      //sphereRef.current?.scale(1.001, 1.001, 1.001);
    });
    return unsub;
  }, [api]);
  const grow = () => {
    setSize((size) => size + 0.1);
  };
  return (
    //@ts-ignore
    <mesh
      {...props}
      position={prevPos?.current && [...prevPos.current, 0]}
      ref={ref as RefObject<Mesh>}
      onClick={grow}
    >
      {type === "box" ? (
        <boxGeometry args={[size, size, 1]} />
      ) : (
        <sphereGeometry args={[size, 64, 32]} />
      )}
      <meshPhongMaterial color={color} shininess={500} />
    </mesh>
  );
};
