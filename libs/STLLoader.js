import {
	BufferGeometry,
	FileLoader,
	Loader,
	LoaderUtils,
	Vector3
} from './three.module.js';

class STLLoader extends Loader {

	constructor( manager ) {

		super( manager );

	}

	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const loader = new FileLoader( scope.manager );
		loader.setPath( scope.path );
		loader.setRequestHeader( scope.requestHeader );
		loader.setWithCredentials( scope.withCredentials );
		loader.load( url, function ( text ) {

			onLoad( scope.parse( text ) );

		}, onProgress, onError );

	}

	parse( data ) {

		const isBinary = this.isBinary( data );

		return isBinary ? this.parseBinary( data ) : this.parseASCII( this.ensureString( data ) );

	}

	isBinary( data ) {

		const reader = new DataView( data, 0, 80 );

		for ( let i = 0; i < 80; i ++ ) {

			if ( reader.getUint8( i ) > 127 ) {

				return true;

			}

		}

		return false;

	}

	ensureString( buffer ) {

		if ( typeof buffer !== 'string' ) {

			return LoaderUtils.decodeText( new Uint8Array( buffer ) );

		}

		return buffer;

	}

	parseBinary( data ) {

		const reader = new DataView( data );
		const faces = reader.getUint32( 80, true );

		let r, g, b, hasColors = false, colors;

		let defaultR, defaultG, defaultB, alpha;

		const dataOffset = 84;
		const faceLength = 12 * 4 + 2;

		let offset = 0;

		const geometry = new BufferGeometry();

		const vertices = [];
		const normals = [];

		for ( let face = 0; face < faces; face ++ ) {

			const start = dataOffset + face * faceLength;
			const normalX = reader.getFloat32( start, true );
			const normalY = reader.getFloat32( start + 4, true );
			const normalZ = reader.getFloat32( start + 8, true );

			for ( let i = 1; i <= 3; i ++ ) {

				const vertexstart = start + i * 12;
				vertices.push( reader.getFloat32( vertexstart, true ), reader.getFloat32( vertexstart + 4, true ), reader.getFloat32( vertexstart + 8, true ) );
				normals.push( normalX, normalY, normalZ );

			}

		}

		geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
		geometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );

		return geometry;

	}

	parseASCII( data ) {

		const geometry = new BufferGeometry();
		const patternFace = /facet([\s\S]*?)endfacet/g;

		const vertices = [];
		const normals = [];

		let result;

		while ( ( result = patternFace.exec( data ) ) !== null ) {

			const resultText = result[ 0 ];
			const normal = this.parseNormal( resultText );
			const verticesData = this.parseVertices( resultText );

			for ( let i = 0; i < verticesData.length; i ++ ) {

				normals.push( normal.x, normal.y, normal.z );
				vertices.push( verticesData[ i ].x, verticesData[ i ].y, verticesData[ i ].z );

			}

		}

		geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
		geometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );

		return geometry;

	}

	parseNormal( data ) {

		const patternNormal = /normal\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)/g;
		const result = patternNormal.exec( data );

		if ( result !== null ) {

			return new Vector3( parseFloat( result[ 1 ] ), parseFloat( result[ 2 ] ), parseFloat( result[ 3 ] ) );

		}

		return new Vector3( 0, 0, 0 );

	}

	parseVertices( data ) {

		const patternVertex = /vertex\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)/g;
		const vertices = [];
		let result;

		while ( ( result = patternVertex.exec( data ) ) !== null ) {

			vertices.push( new Vector3( parseFloat( result[ 1 ] ), parseFloat( result[ 2 ] ), parseFloat( result[ 3 ] ) ) );

		}

		return vertices;

	}

}

export { STLLoader };
