import {
	BufferGeometry,
	FileLoader,
	Loader,
	LoaderUtils,
	Vector3,
	Float32BufferAttribute
} from '../three.module.js';

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
		loader.setResponseType( 'arraybuffer' );  // ✅ 這行很重要：讓FileLoader回傳ArrayBuffer

		loader.load( url, function ( data ) {
			onLoad( scope.parse( data ) );
		}, onProgress, onError );

	}

	parse( data ) {

		const isBinary = this.isBinary( data );

		return isBinary ? this.parseBinary( data ) : this.parseASCII( this.ensureString( data ) );

	}

	isBinary( data ) {

		const reader = new DataView( data, 0, Math.min( data.byteLength, 80 ) );

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

		const geometry = new BufferGeometry();

		const vertices = [];
		const normals = [];

		let offset = 84;
		for ( let face = 0; face < faces; face ++ ) {

			const normalX = reader.getFloat32( offset, true );
			const normalY = reader.getFloat32( offset + 4, true );
			const normalZ = reader.getFloat32( offset + 8, true );

			for ( let i = 1; i <= 3; i ++ ) {
				const start = offset + i * 12;
				vertices.push(
					reader.getFloat32( start, true ),
					reader.getFloat32( start + 4, true ),
					reader.getFloat32( start + 8, true )
				);
				normals.push( normalX, normalY, normalZ );
			}

			offset += 50; // 12*4*4 bytes + 2 bytes attribute
		}

		geometry.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
		geometry.setAttribute( 'normal', new Float32BufferAttribute( normals, 3 ) );

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

		geometry.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
		geometry.setAttribute( 'normal', new Float32BufferAttribute( normals, 3 ) );

		return geometry;
	}

	parseNormal( data ) {

		const patternNormal = /normal\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)/g;
		const result = patternNormal.exec( data );

		if ( result !== null ) {
			return new Vector3(
				parseFloat( result[ 1 ] ),
				parseFloat( result[ 2 ] ),
				parseFloat( result[ 3 ] )
			);
		}

		return new Vector3( 0, 0, 0 );
	}

	parseVertices( data ) {

		const patternVertex = /vertex\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)/g;
		const vertices = [];
		let result;

		while ( ( result = patternVertex.exec( data ) ) !== null ) {
			vertices.push( new Vector3(
				parseFloat( result[ 1 ] ),
				parseFloat( result[ 2 ] ),
				parseFloat( result[ 3 ] )
			) );
		}

		return vertices;
	}

}

export { STLLoader };
