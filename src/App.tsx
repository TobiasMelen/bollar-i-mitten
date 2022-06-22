import { Canvas, MeshProps, useFrame } from "@react-three/fiber";
import { Duplet, Physics, useCircle } from "@react-three/p2";
import { useEffect } from "react";
import { Color } from "three";

function App() {
  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <pointLight position={[1, 1, 2]} intensity={2} />
      <Physics gravity={[0, 0]} normalIndex={2}>
        <Ball position={[-3, 2]} color="green" />
        <Ball />
        <Ball position={[2.5, 2]} color="blue" />
        <Ball position={[5, 5]} color="hotpink" />
      </Physics>
    </Canvas>
  );
}

export default App;

type BallProps = Omit<MeshProps, "position"> & {
  mass?: number;
  color?: Color | string;
  position?: Duplet;
};

const Ball = ({ mass = 1, color = "red", ...props }: BallProps) => {
  const [ref, api] = useCircle(() => ({
    mass,
    position: props.position,
  }));
  useEffect(() => {
    const unsub = api.position.subscribe(([x, y]) => {
      api.applyForce([x < 0 ? 1 : -1, y < 0 ? 1 : -1], [0, 0]);
      ref.current?.scale.addScalar(.001);
    });
    return unsub;
  }, [api]);
  return (
    //@ts-ignore
    <mesh {...props} ref={ref}>
      <sphereGeometry args={[1, 64, 32]} />
      <meshPhongMaterial color={color} shininess={500} />
    </mesh>
  );
};
