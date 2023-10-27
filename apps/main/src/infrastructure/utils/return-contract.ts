export class ReturnContract<T> {
	constructor(public data: T | null, public error: string | null) {
		this.data = data
		this.error = error
	}
}
