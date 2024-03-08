(module
	;; Import wasi
	(import "wasi_snapshot_preview1" "fd_write" (func $fd_write (param i32 i32 i32 i32) (result i32)))

	;; Memory
	(memory 1)
	(export "memory" (memory 0))

	;; Data segment to hold the "Hello, world!\n" string
	(data (i32.const 1024) "祝:Hello, world!\0A")

	;; start function
	(func $_start (export "_start")
		;; iovec struct - pointer to the buffer and length
		(i32.store (i32.const 0) (i32.const 1024)) ;; Buffer offset
		(i32.store (i32.const 4) (i32.const 18))   ;; Buffer length

		;; Call fd_write
		;; Parameters: fd (1 for stdout), *iovs (pointer to iovec struct), iovs_len (1), nwritten (pointer to store number of bytes written)
		(call $fd_write
			(i32.const 1)    ;; file descriptor for stdout
			(i32.const 0)    ;; pointer to iovec array
			(i32.const 1)    ;; number of iovec elements
			(i32.const 20)   ;; pointer to store number of bytes written
		)
		drop ;; Ignore the result (number of bytes written)

		;; store the result of add function to memory
		;; Call add function
		(i32.store
			(i32.const 1024)
			(call $add
				(call $add (i32.const 1) (i32.const 4)
				(i32.const 48)) ;; convert to ascii
			)
		)


		;; invec struct - pointer to the buffer and length
		(i32.store (i32.const 0) (i32.const 1024)) ;; Buffer offset
		(i32.store (i32.const 4) (i32.const 2))   ;; Buffer length


		(call $fd_write
			(i32.const 1)    ;; file descriptor for stdout
			(i32.const 0)    ;; pointer to iovec array
			(i32.const 1)    ;; number of iovec elements
			(i32.const 20)   ;; pointer to store number of bytes written
		)
		drop ;; Ignore the result (number of bytes written)
	)

	(func $add (param $a i32) (param $b i32) (result i32)
		local.get $a
		local.get $b
		i32.add
	)
	(export "add" (func $add))
)