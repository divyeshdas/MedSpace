import adapterVercel from '@sveltejs/adapter-vercel'
import adapterNode from '@sveltejs/adapter-node'

const adapter = process.env.VERCEL
	? adapterVercel({
			runtime: 'nodejs24.x',
			memory: 512,
			regions: ['bom1']
		})
	: adapterNode()

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		adapter
	}
}

export default config
