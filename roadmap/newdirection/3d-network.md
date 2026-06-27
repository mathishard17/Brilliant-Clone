# 3D Network

## Product Goal

The Home Hub schema board should feel like a 3D long-term-memory network that the learner can move around. The learner is not just looking at a lesson list. They are rotating a glowing math-brain structure and choosing which schema node to build next.

## How This Implementation Works

The current implementation uses regular React, SVG, and CSS 3D transforms. It does not use WebGL or a physics engine yet.

Core pieces:

- `KnowledgeGraphHub.tsx` owns the interaction state.
- `KnowledgeGraphHub.tsx` listens for pointer events on the graph board.
- Dragging empty graph space changes `rotateX` and `rotateY`.
- Scrolling the mouse wheel or using the `+` / `-` buttons changes `zoom`.
- Those values are passed into CSS variables:
  - `--graph-rotate-x`
  - `--graph-rotate-y`
  - `--graph-rotate-z`
  - `--graph-zoom`
- `screens.css` applies those variables to `.knowledge-graph__space` using CSS transforms.

The important CSS idea:

```css
.knowledge-graph__map {
  perspective: 900px;
  transform-style: preserve-3d;
}

.knowledge-graph__space {
  transform:
    rotateX(var(--graph-rotate-x))
    rotateY(var(--graph-rotate-y))
    rotateZ(var(--graph-rotate-z))
    scale(var(--graph-zoom));
  transform-style: preserve-3d;
}
```

Each dot also has a fake depth value through `translateZ(...)`, so some dots feel closer to the viewer than others.

## Pointer Drag Pattern

The drag behavior uses pointer events because they work for both mouse and touch:

- `onPointerDown`: record the starting pointer position and starting rotation.
- `onPointerMove`: compare the current pointer position to the starting position.
- Horizontal drag changes `rotateY`.
- Vertical drag changes `rotateX`.
- `onPointerUp` / `onPointerCancel`: stop dragging.

The current interaction ignores drags that begin on a button, so learners can still tap real nodes and controls.

## Zoom Pattern

Current zoom support is simple:

- Mouse/trackpad wheel changes `graphView.zoom`.
- The `+` and `-` buttons change the same zoom value for touch users.
- Zoom is clamped so the board cannot become microscopic or enormous.
- The reset button restores rotation and zoom.

This is still not the same as a real 3D camera zoom. It scales the transformed DOM graph. For true 3D camera zoom, use a WebGL camera with OrbitControls or TrackballControls.

## Why It Looks 3D

The effect comes from combining:

- `perspective` on the board container.
- `rotateX` / `rotateY` on the graph layer.
- `translateZ` on dots.
- Glow and shadow layers.
- A faint floor/grid plane behind the graph.

This is a lightweight “2.5D” approach. The DOM is still 2D, but CSS makes it behave like a tilted 3D object.

## Node States And Unlock Rules

Graph status is derived from existing lesson progress plus code-owned edges in `src/types/knowledgeGraph.ts`.

- **Locked:** dim, grayscale, cannot open.
- **Available:** pulsing neon glow; starter nodes and nodes whose prerequisites are all mastered.
- **In progress:** stronger glow plus progress ring; learner has meaningful saved progress.
- **Mastered:** brightest steady glow; lesson completed.

Unlock rules:

1. **Starter nodes** (`counting_choices`, `chance_as_fraction`) are available on day one. These map to themed lessons such as expedition outfit counting and dinosaur chance spinners.
2. **Other nodes** unlock only when every connected prerequisite node is `mastered`.
3. **Coming-soon lessons** stay locked even if the graph node would otherwise unlock.

Use `canEnterKnowledgeNode()` before opening a lesson from the graph detail panel or manage-page list.

## How People Usually Build This

There are three common levels:

1. CSS 3D transforms
   - Best for lightweight dashboards, cards, maps, and small interactive networks.
   - Easy to style with HTML/CSS.
   - Good for this app right now.

2. SVG plus CSS transforms
   - Good when connections/lines need to stay crisp.
   - Current implementation uses SVG lines plus HTML dots.

3. WebGL / Three.js
   - Best for thousands of nodes, real camera movement, orbit controls, particles, and physics.
   - More powerful, but more code and more performance complexity.
   - A future version could move this board to Three.js if it needs true 3D camera orbit, zoom, and particle depth.

## Source Code And Libraries To Study

These are the closest matches to the vision:

- `vasturiano/3d-force-graph`
  - GitHub: https://github.com/vasturiano/3d-force-graph
  - Demo/API: https://vasturiano.github.io/3d-force-graph/
  - What it does: real 3D graph rendering with Three.js/WebGL, `d3-force-3d` or `ngraph` physics, camera controls, node/link hover, click, drag, and zoom.
  - Why it matters: this is the strongest direct match for a draggable 3D schema network.

- `vasturiano/react-force-graph`
  - GitHub: https://github.com/vasturiano/react-force-graph
  - Demo/API: https://vasturiano.github.io/react-force-graph/
  - What it does: React wrappers for 2D, 3D, VR, and AR force graphs. The 3D version uses Three.js/WebGL and built-in navigation controls.
  - Why it matters: this is likely the easiest migration path for this React app.

- `vasturiano/r3f-forcegraph`
  - GitHub: https://github.com/vasturiano/r3f-forcegraph
  - What it does: React Three Fiber bindings for force-directed graphs.
  - Why it matters: useful if the app later uses `@react-three/fiber` for a more custom Three.js scene.

- Three.js + OrbitControls from scratch
  - Three.js: https://threejs.org/
  - Pattern: create a `Scene`, `PerspectiveCamera`, `WebGLRenderer`, glowing sphere meshes for nodes, line segments/tubes for edges, and `OrbitControls` for rotate/zoom/pan.
  - Why it matters: maximum control, but highest implementation cost.

## Deeper Research Findings

The main lesson from looking at real implementations is that a convincing 3D graph is usually split into four systems:

1. Graph data
   - Stable app-owned data: nodes, links, groups/schemas, completion state, labels, click targets.
   - Example shape:
     ```ts
     {
       nodes: [{ id: 'counting_choices', group: 'counting_probability', val: 4 }],
       links: [{ source: 'counting_choices', target: 'ordered_arrangements' }]
     }
     ```

2. Layout / physics
   - This computes actual `x`, `y`, `z` positions.
   - Common libraries:
     - `d3-force-3d`: https://github.com/vasturiano/d3-force-3d
     - `ngraph.forcelayout`: https://github.com/anvaka/ngraph.forcelayout
   - `d3-force-3d` extends D3 force simulation into 3D with `x/y/z` and `vx/vy/vz`.
   - `ngraph.forcelayout` can run in arbitrary dimensions and supports `{ dimensions: 3 }`.

3. Rendering
   - This draws the result.
   - Current app uses HTML/SVG/CSS, which is why it keeps feeling like a flat layer.
   - Real graph UIs use WebGL through Three.js.
   - For small graphs, individual `Mesh` spheres and `Line` edges are fine.
   - For large graphs, use:
     - `THREE.InstancedMesh` for many nodes in few draw calls.
     - `THREE.LineSegments` with buffer geometry for many edges.
     - GPU picking or optimized raycasting when the graph gets large.

4. Camera and interaction
   - This is where rotate/zoom/pan should happen.
   - The normal pattern is `OrbitControls`, `TrackballControls`, or the controls built into `3d-force-graph`.
   - Hover/click selection usually uses a `Raycaster`.
   - Tooltip labels can be HTML overlays or Three.js/CSS2D labels.

## Important Libraries Found

### `3d-force-graph`

https://github.com/vasturiano/3d-force-graph

This is the closest single library to the desired board. It provides:

- Three.js/WebGL rendering.
- Real 3D node-link graph.
- `d3-force-3d` or `ngraph` physics.
- Built-in controls: `trackball`, `orbit`, and `fly`.
- Camera APIs like `cameraPosition(...)`.
- Hover/click callbacks.
- Node/link styling APIs.

This would likely produce the biggest visual improvement fastest.

### `react-force-graph`

https://github.com/vasturiano/react-force-graph

React wrapper around the force-graph family. It includes `react-force-graph-3d`.

Useful props:

- `graphData`
- `nodeColor`
- `nodeVal`
- `nodeLabel`
- `linkColor`
- `linkWidth`
- `onNodeClick`
- `onNodeHover`
- `nodeThreeObject`
- `enableNavigationControls`
- `controlType`

This is probably the best fit for this React app because it avoids manually wiring Three.js lifecycle into React.

### `d3-force-3d`

https://github.com/vasturiano/d3-force-3d

This is a layout engine, not a renderer. It computes positions. You still need SVG, Canvas, or WebGL to draw those positions.

Research note:

- It uses velocity Verlet integration.
- You create a simulation, add forces such as charge/link/center, and listen to ticks.
- In 3D, nodes have `x`, `y`, `z`, `vx`, `vy`, and `vz`.

### `ngraph.forcelayout`

https://github.com/anvaka/ngraph.forcelayout

Alternative layout engine. The old `ngraph.forcelayout3d` is deprecated in favor of `ngraph.forcelayout`, which supports 2D, 3D, and higher dimensions.

Research note:

```js
let layout = createLayout(graph, { dimensions: 3 })
let nodePosition = layout.getNodePosition(nodeId) // { x, y, z }
```

### `reagraph`

https://github.com/reaviz/reagraph

React graph visualization library using Three.js / React Three Fiber. It includes systems for:

- Graph canvas.
- 2D/3D layouts.
- Camera controls.
- Selection.
- Clustering.
- Themes.

This may be more productized than raw Three.js, but it is also heavier and more opinionated.

### `galaxy-nodes`

https://github.com/danielsobrado/galaxy-nodes

Interesting because the metaphor is close to what we want: dense graph data as a 3D galaxy of nodes, clusters, and relationships.

Useful ideas:

- GPU point clouds.
- Cluster filaments.
- Search/filter workflows.
- Major interactive nodes.
- Reduced-motion support.
- Hover/click inspection.

## What Real Implementations Do Differently From Our CSS Version

The current app has been trying to imitate 3D with DOM transforms. That is fragile.

Real implementations:

- Store every node in actual 3D coordinates.
- Render nodes as 3D objects in a scene.
- Use a camera, not a rotated HTML layer.
- Move the camera for rotate/zoom/pan.
- Use raycasting to find which node is under the pointer.
- Let a layout engine settle clusters into readable positions.

That is why the CSS approach keeps producing problems like:

- flat-plane feeling
- odd overlays
- invisible dots after transforms
- tooltips fighting transformed coordinate systems
- lines still feeling like SVG projected onto a sheet

## Production Architecture Recommendation

For this app, the best next implementation is:

1. Install `react-force-graph-3d` and `three`.
2. Create `src/components/SchemaForceGraph3D.tsx`.
3. Convert existing `KNOWLEDGE_NODES`, `KNOWLEDGE_EDGES`, ambient nodes, and schema colors into `graphData`.
4. Use:
   - `nodeColor` for schema color.
   - `nodeVal` for mastery brightness/size.
   - `linkColor` for schema color.
   - `linkWidth` for mastered connections.
   - `onNodeClick` to open/select lesson nodes.
   - `onNodeHover` to set the detail panel.
   - `controlType="orbit"` or `controlType="trackball"`.
5. Keep the accessible lesson list outside the WebGL canvas.

Rough React sketch:

```tsx
import ForceGraph3D from 'react-force-graph-3d'

<ForceGraph3D
  graphData={graphData}
  controlType="orbit"
  nodeColor={(node) => node.color}
  nodeVal={(node) => node.mastered ? 4 : 1.5}
  linkColor={(link) => link.color}
  linkWidth={(link) => link.mastered ? 2 : 0.5}
  onNodeClick={(node) => openLesson(node.lessonId)}
  onNodeHover={(node) => setHoveredNode(node)}
/>
```

## Performance Notes

For this app's current size, `react-force-graph-3d` is more than enough.

If the graph eventually becomes large:

- Move layout computation to a Web Worker.
- Use `InstancedMesh` for nodes.
- Use one `LineSegments` buffer for many edges.
- Use level-of-detail rules for far-away labels and small nodes.
- Use optimized raycasting or GPU picking if hover becomes slow.

## Recommended Next Technical Direction

The current CSS/SVG implementation is good for proving the product metaphor, but it will keep feeling like a flat plane when pushed too far. For the real version, migrate the graph board to `react-force-graph-3d` or `3d-force-graph`.

Suggested migration:

1. Keep `KnowledgeNode`, `KnowledgeEdge`, and schema progress as the app-owned data model.
2. Convert them into `graphData = { nodes, links }`.
3. Render the graph with `react-force-graph-3d`.
4. Use built-in navigation controls for orbit/zoom/pan.
5. Customize node colors by schema and node brightness by mastery.
6. Keep the existing accessible lesson list outside the WebGL canvas.

## Current Constraints

- This is not a true 3D graph engine.
- Edges are still SVG lines on the transformed plane.
- Dot positions are manually authored percentages.
- Rotation is intentionally clamped so learners cannot flip the board upside down.
- Tooltips are counter-tilted so they stay readable.

## Future Improvements

- Add pinch-to-zoom if staying with CSS/SVG.
- Add inertial rotation after drag release.
- Add keyboard controls for rotate/reset.
- Add a minimap or “front view” button.
- Add real schema clusters with generated node positions.
- Move to `react-force-graph-3d` for actual 3D camera controls, physics layout, and real depth.
