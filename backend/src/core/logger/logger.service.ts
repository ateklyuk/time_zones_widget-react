import { Injectable, ConsoleLogger } from '@nestjs/common';
import * as fs from 'fs-extra';

const MILLISECONDS_IN_SECOND = 60000;

@Injectable()
export class LoggerService extends ConsoleLogger {
	private readonly logsDirectory = 'src/core/logger/logs';

	private readonly logFileName = 'logs';

	private readonly logFileExtension = 'log';

	private readonly maxLogFileSize = 2_048_000;

	constructor() {
		super();
	}

	private getLogFilePath(subdomain?: string): string {
		const subdomainPath = subdomain ? `/${subdomain}` : '';
		return `${this.logsDirectory}${subdomainPath}/${this.logFileName}.${this.logFileExtension}`;
	}

	private clearLogFile(filePath: string): void {
		try {
			fs.truncateSync(filePath);
		} catch (error) {
			super.error(error);
		}
	}

	private checkLogFileSize(filePath: string): void {
		try {
			const stats = fs.statSync(filePath);

			if (stats.size >= this.maxLogFileSize) {
				this.clearLogFile(filePath);
			}
		} catch (error) {
			super.error(error);
		}
	}

	private logToFile(
		message: string,
		context?: string,
		subdomain?: string,
	): void {
		try {
			const logFilePath = this.getLogFilePath(subdomain);

			this.checkLogFileSize(logFilePath);

			const timezoneOffset =
				new Date().getTimezoneOffset() * MILLISECONDS_IN_SECOND;

			fs.ensureFileSync(logFilePath);
			fs.appendFileSync(
				logFilePath,
				`[${new Date(Date.now() - timezoneOffset)
					.toISOString()
					.slice(0, -1)}] [${context}] ${message}\n`,
			);
		} catch (error) {
			super.error(error);
		}
	}

	private messageStringifyer(message: unknown): string {
		return JSON.stringify(message);
	}

	public debug(message: unknown, context = '', subdomain?: string): void {
		try {
			super.debug(message, context);

			this.logToFile(
				`DEBUG: ${this.messageStringifyer(message)}`,
				context,
				subdomain,
			);
		} catch (error) {
			super.error(error);
		}
	}

	public info(message: unknown, context = '', subdomain?: string): void {
		try {
			super.log(message, context);

			this.logToFile(
				`INFO: ${this.messageStringifyer(message)}`,
				context,
				subdomain,
			);
		} catch (error) {
			super.error(error);
		}
	}

	public warn(message: unknown, context = '', subdomain?: string): void {
		try {
			super.warn(message, context);

			this.logToFile(
				`WARNING: ${this.messageStringifyer(message)}`,
				context,
				subdomain,
			);
		} catch (error) {
			super.error(error);
		}
	}

	public error(
		message: unknown,
		context = '',
		subdomain?: string,
		trace?: string,
	): void {
		try {
			super.error(message, trace, context);

			const errorMessage = trace
				? `ERROR: ${this.messageStringifyer(
						message,
				  )}\nStack Trace:\n${trace}`
				: `ERROR: ${this.messageStringifyer(message)}`;
			this.logToFile(errorMessage, context, subdomain);
		} catch (error) {
			super.error(error);
		}
	}
}
